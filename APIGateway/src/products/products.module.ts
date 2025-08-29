import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { HttpModule } from '@nestjs/axios';
import { ProductsInterceptor } from '../interceptors/products.interceptor';

@Module({
  imports: [HttpModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ProductsInterceptor,
    },
  ],
})
export class ProductsModule {}
