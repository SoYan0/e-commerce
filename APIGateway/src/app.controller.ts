import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { RequireAuth } from './auth/decorators/require-auth.decorator';
import { Request } from 'express';
import './auth/interfaces/user.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  getHealth(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'API Gateway',
      version: '1.0.0',
    };
  }

  @Get('status')
  @Public()
  getStatus(): object {
    return {
      gateway: 'running',
      services: {
        auth: 'http://localhost:3001',
        products: 'http://localhost:3002',
        orders: 'http://localhost:3003',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test-auth')
  @RequireAuth(['user', 'admin'])
  testAuth(@Req() req: Request): object {
    console.log('TEST AUTH - req.user:', req.user);
    return {
      message: 'Authentication successful',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }
}
