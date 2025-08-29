import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from '../config.example';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    errorHttpStatusCode: HttpStatus.BAD_REQUEST,
  }));

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });
  
  await app.listen(config.port, '0.0.0.0');
  console.log(`API Gateway is running on port ${config.port}`);
  console.log(`Health check available at http://localhost:${config.port}/health`);
}
bootstrap();
