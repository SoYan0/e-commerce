import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { ProductsClient } from './products.client';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrdersController],
  providers: [OrdersService, ProductsClient],
  exports: [OrdersService],
})
export class OrdersModule {}
