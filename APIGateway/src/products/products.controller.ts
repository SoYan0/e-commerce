import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetAllProductsQueryDto } from './dto/get-all-products-query.dto';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly http: HttpService,
  ) {}

  // Public endpoints - accessible to everyone
  @Public()
  @Get()
  async getAllProducts(
    @Query() query: GetAllProductsQueryDto,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.get('http://localhost:3002/products', { params: query }),
    );
    return response.data;
  }

  @Public()
  @Get('search')
  async searchProducts(@Query() filter: SearchFiltersDto): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.get('http://localhost:3002/products/search', {
        params: filter,
      }),
    );
    return response.data;
  }

  @Public()
  @Post('categories')
  async getProductsByCategories(
    @Body('categories') categories: string[],
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3002/products/categories', {
        categories,
      }),
    );
    return response.data;
  }

  @Public()
  @Get('bulk')
  async getProductsByIds(@Query('ids') ids: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.get('http://localhost:3002/products/bulk', { params: { ids } }),
    );
    return response.data;
  }

  @Public()
  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.get(`http://localhost:3002/products/${id}`),
    );
    return response.data;
  }

  // Admin endpoints - only accessible to admin users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create')
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFile() file: FileUpload,
  ): Promise<unknown> {
    // Create FormData to send both the DTO and file
    const formData = new FormData();

    // Add all DTO fields to FormData
    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined && dto[key] !== null) {
        if (key === 'categories' && Array.isArray(dto[key])) {
          // Handle categories array properly
          dto[key].forEach((category) => {
            formData.append('categories', category);
          });
        } else {
          formData.append(key, dto[key]);
        }
      }
    });

    // Add file if it exists - convert Buffer to Blob properly
    if (file) {
      // Convert Buffer to Uint8Array first, then to Blob
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], {
        type: file.mimetype || 'application/octet-stream',
      });
      formData.append('file', blob, file.originalname);
    }

    const response = await firstValueFrom(
      this.http.post('http://localhost:3002/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('update/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file: FileUpload,
  ): Promise<unknown> {
    // Create FormData to send both the DTO and file
    const formData = new FormData();

    // Add all DTO fields to FormData
    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined && dto[key] !== null) {
        if (key === 'categories' && Array.isArray(dto[key])) {
          // Handle categories array properly
          dto[key].forEach((category) => {
            formData.append('categories', category);
          });
        } else {
          formData.append(key, dto[key]);
        }
      }
    });

    // Add file if it exists - convert Buffer to Blob properly
    if (file) {
      // Convert Buffer to Uint8Array first, then to Blob
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], {
        type: file.mimetype || 'application/octet-stream',
      });
      formData.append('file', blob, file.originalname);
    }

    const response = await firstValueFrom(
      this.http.patch(`http://localhost:3002/admin/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('delete/:id')
  async deleteProduct(@Param('id') id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.delete(`http://localhost:3002/admin/products/${id}`),
    );
    return response.data;
  }
}
