import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`AuthGuard: ${method} ${url} - isPublic: ${isPublic}`);

    if (isPublic) {
      this.logger.debug(`Public route accessed: ${method} ${url}`);
      return true;
    }

    const { user } = request;
    
    if (!user) {
      this.logger.warn(`Unauthenticated access attempt to protected route: ${method} ${url}`);
      throw new UnauthorizedException('Authentication required');
    }

    this.logger.debug(`Authenticated user ${user.email} (${user.role}) accessing: ${method} ${url}`);
    return true;
  }
}
