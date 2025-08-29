import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

interface RequestWithUser {
  method: string;
  url: string;
  body: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  user?: { role: string };
  ip?: string;
  connection?: { remoteAddress: string };
  get(header: string): string | undefined;
  timestamp?: number;
}

interface FileUpload {
  size?: number;
  mimetype?: string;
  originalname?: string;
}

interface ProductData {
  name?: string;
  price?: number | string;
  description?: string;
  categories?: string[];
  file?: FileUpload;
}

@Injectable()
export class ProductsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ProductsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest() as RequestWithUser;
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection?.remoteAddress || '';

    // Log incoming request
    this.logger.log(
      `[PRODUCTS INTERCEPTOR] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    // Only process products-related routes
    if (!url.startsWith('/products')) {
      this.logger.debug(`[PRODUCTS INTERCEPTOR] Skipping non-products route: ${method} ${url}`);
      return next.handle(); // Skip interceptor processing for non-products routes
    }

    // Validate and sanitize request data
    this.validateRequest(request);

    // Log request details
    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`Request Query: ${JSON.stringify(query)}`);
    }

    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`Request Params: ${JSON.stringify(params)}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      // Transform response data
      map((response: unknown) => {
        return this.transformResponse(response, request);
      }),
      // Log successful response
      tap((response: unknown) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `[PRODUCTS INTERCEPTOR] ${method} ${url} - ${responseTime}ms - SUCCESS`,
        );
        this.logger.debug(`Response: ${JSON.stringify(response)}`);
      }),
      // Handle errors
      catchError((error: unknown) => {
        const responseTime = Date.now() - now;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `[PRODUCTS INTERCEPTOR] ${method} ${url} - ${responseTime}ms - ERROR: ${errorMessage}`,
        );
        
        // Transform error response
        const transformedError = this.transformError(error);
        return throwError(() => transformedError);
      }),
    );
  }

  private validateRequest(request: RequestWithUser): void {
    const { method, url, body, query } = request;

    // Only validate products-related routes
    if (!url.startsWith('/products')) {
      return; // Skip validation for non-products routes
    }

    // Validate pagination parameters
    if (url === '/products' && method === 'GET') {
      if (query.page && (isNaN(Number(query.page)) || parseInt(query.page) < 1)) {
        throw new BadRequestException('Page must be a positive number');
      }
      if (query.limit && (isNaN(Number(query.limit)) || parseInt(query.limit) < 1 || parseInt(query.limit) > 100)) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
    }

    // Validate search parameters
    if (url === '/products/search' && method === 'GET') {
      if (query.search && query.search.trim().length < 2) {
        throw new BadRequestException('Search term must be at least 2 characters long');
      }
    }

    // Validate admin endpoints (only for products routes)
    if (url.includes('/admin/') || (url.startsWith('/products') && (method === 'POST' || method === 'PATCH' || method === 'DELETE'))) {
      if (!request.user || !request.user.role || request.user.role !== 'admin') {
        throw new BadRequestException('Admin access required');
      }
    }

    // Validate file uploads (only for products routes)
    if ((method === 'POST' || method === 'PATCH') && body && body.file) {
      this.validateFileUpload(body.file);
    }

    // Validate product data for create/update (only for products routes)
    if ((method === 'POST' || method === 'PATCH') && body) {
      this.validateProductData(body);
    }
  }

  private validateProductData(data: ProductData): void {
    // Validate required fields for product creation
    if (data.name && data.name.trim().length < 2) {
      throw new BadRequestException('Product name must be at least 2 characters long');
    }

    if (data.price && (isNaN(Number(data.price)) || parseFloat(String(data.price)) < 0)) {
      throw new BadRequestException('Price must be a positive number');
    }

    if (data.description && data.description.trim().length < 10) {
      throw new BadRequestException('Description must be at least 10 characters long');
    }

    if (data.categories && (!Array.isArray(data.categories) || data.categories.length === 0)) {
      throw new BadRequestException('Categories must be a non-empty array');
    }
  }

  private validateFileUpload(file: FileUpload): void {
    if (!file) return;

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size && file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Check file name
    if (file.originalname && file.originalname.trim().length === 0) {
      throw new BadRequestException('File name cannot be empty');
    }
  }

  private transformResponse(response: unknown, request: RequestWithUser): unknown {
    if (!response) return response;

    // Add metadata to response
    const transformedResponse: Record<string, any> = {
      ...(response as Record<string, any>),
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: request.url,
        method: request.method,
        version: '1.0',
        requestId: this.generateRequestId(),
      },
    };

    // Transform pagination response
    if (response && typeof response === 'object' && 'products' in response && 'total' in response) {
      const resp = response as { products: any[]; total: number; page?: number; lastPage?: number; limit?: number };
      transformedResponse.pagination = {
        currentPage: resp.page || 1,
        totalPages: resp.lastPage || Math.ceil(resp.total / (resp.limit || 10)),
        totalItems: resp.total,
        itemsPerPage: resp.limit || 10,
        hasNextPage: (resp.page || 1) < (resp.lastPage || 1),
        hasPreviousPage: (resp.page || 1) > 1,
      };
    }

    // Transform single product response
    if (response && typeof response === 'object' && 'id' in response && 'name' in response && !('products' in response)) {
      transformedResponse.product = response;
      delete (transformedResponse as any).id;
      delete (transformedResponse as any).name;
      // Keep other properties
    }

    // Add performance metrics
    transformedResponse.performance = {
      responseTime: Date.now() - new Date(request.timestamp || Date.now()).getTime(),
      cacheHit: false, // You can implement cache logic here
    };

    return transformedResponse;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private transformError(error: unknown): any {
    // Standardize error response format
    const errorResponse: Record<string, any> = {
      statusCode: (error as any)?.status || 500,
      message: (error as any)?.message || 'Internal server error',
      error: (error as any)?.error || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: (error as any)?.path || '',
      requestId: this.generateRequestId(),
    };

    // Add validation errors if present
    if ((error as any)?.response?.data) {
      errorResponse.details = (error as any).response.data;
    }

    // Add error code for client handling
    const status = (error as any)?.status;
    if (status === 400) {
      errorResponse.errorCode = 'VALIDATION_ERROR';
    } else if (status === 401) {
      errorResponse.errorCode = 'UNAUTHORIZED';
    } else if (status === 403) {
      errorResponse.errorCode = 'FORBIDDEN';
    } else if (status === 404) {
      errorResponse.errorCode = 'NOT_FOUND';
    } else {
      errorResponse.errorCode = 'INTERNAL_ERROR';
    }

    // Log detailed error for debugging
    this.logger.error(`Error details: ${JSON.stringify(errorResponse)}`);

    // Return appropriate exception based on error type
    if (status === 400) {
      return new BadRequestException(errorResponse);
    } else if (status === 401) {
      return new BadRequestException(errorResponse);
    } else if (status === 403) {
      return new BadRequestException(errorResponse);
    } else if (status === 404) {
      return new BadRequestException(errorResponse);
    } else {
      return new InternalServerErrorException(errorResponse);
    }
  }
}
