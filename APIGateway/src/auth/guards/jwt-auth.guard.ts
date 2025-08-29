import { Injectable, Logger, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super(); // Call super() constructor
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.debug(`JwtAuthGuard: ${method} ${url} - isPublic: ${isPublic}`);

    // If route is public, skip JWT validation
    if (isPublic) {
      this.logger.debug(`Public route - skipping JWT validation: ${method} ${url}`);
      return true;
    }

    // For protected routes, run JWT validation
    this.logger.debug(`Protected route - running JWT validation: ${method} ${url}`);
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.debug(`JwtAuthGuard handling request: ${method} ${url}`);
    this.logger.debug(`JwtAuthGuard - err: ${err}, user: ${JSON.stringify(user)}, info: ${info}`);

    if (err) {
      this.logger.error(`JWT Auth error: ${err.message}`);
      throw new UnauthorizedException(`Authentication failed: ${err.message}`);
    }

    if (!user) {
      this.logger.warn(`No user found in JWT Auth Guard for: ${method} ${url}`);
      throw new UnauthorizedException('Authentication required');
    }

    // Attach user to request object
    request.user = user;
    
    this.logger.log(`JWT Auth successful for user: ${user.email} (${user.role}) accessing: ${method} ${url}`);
    return user;
  }
}
