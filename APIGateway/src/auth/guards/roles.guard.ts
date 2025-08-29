import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`RolesGuard: ${method} ${url} - isPublic: ${isPublic}`);

    // If route is public, allow access without role checking
    if (isPublic) {
      this.logger.debug(`Public route - skipping role check: ${method} ${url}`);
      return true;
    }

    // Check for required roles from @Roles decorator
    let requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check for required auth from @RequireAuth decorator
    const requireAuth = this.reflector.getAllAndOverride<string[]>('requireAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles from @Roles, use @RequireAuth
    if (!requiredRoles && requireAuth) {
      requiredRoles = requireAuth;
    }

    this.logger.debug(`RolesGuard: ${method} ${url} - requiredRoles: ${requiredRoles}`);

    // If no roles required, allow access
    if (!requiredRoles) {
      this.logger.debug(`No roles required - allowing access: ${method} ${url}`);
      return true;
    }

    const { user } = request;
    
    if (!user) {
      this.logger.warn(`No user found for role check: ${method} ${url}`);
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    this.logger.debug(`User ${user.email} (${user.role}) accessing ${method} ${url} - Required: ${requiredRoles}, Has: ${hasRole}`);
    
    return hasRole;
  }
}
