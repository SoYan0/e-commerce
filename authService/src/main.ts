import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Log JWT secret for debugging
  console.log(`Auth Service - JWT_SECRET: ${process.env.JWT_SECRET || 'NOT_SET'}`);
  console.log(`Auth Service - Using JWT secret: ${process.env.JWT_SECRET || 'default-secret'}`);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
