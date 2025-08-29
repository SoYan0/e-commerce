import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'healthy',
      service: 'OrderService',
      timestamp: new Date().toISOString(),
    };
  }
}
