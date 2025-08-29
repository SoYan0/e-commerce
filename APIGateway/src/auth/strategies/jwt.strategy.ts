import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
    this.logger.log(`JWT Strategy initialized with secret: ${jwtConfig.secret.substring(0, 20)}...`);
  }

  async validate(payload: any) {
    this.logger.debug(`JWT Strategy validating payload: ${JSON.stringify(payload)}`);
    
    // Validate payload structure
    if (!payload.userId || !payload.email || !payload.role) {
      this.logger.error(`Invalid token payload structure: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check if user has a valid role
    if (!['user', 'admin'].includes(payload.role)) {
      this.logger.error(`Invalid user role: ${payload.role}`);
      throw new UnauthorizedException('Invalid user role');
    }

    const user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    this.logger.log(`JWT Strategy validation successful for user: ${user.email} (${user.role})`);
    return user;
  }
}
