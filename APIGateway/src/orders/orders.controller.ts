import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { RequireAuth } from '../auth/decorators/require-auth.decorator';
import { Request } from 'express';
import '../auth/interfaces/user.interface';

@Controller('orders')
@RequireAuth(['user', 'admin'])
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() orderData: any, @Req() req: Request) {
    console.log('POST /orders - req.user:', req.user);
    const userId = req.user?.userId;
    if (!userId) {
      console.log('ERROR: User ID not found in request');
      throw new BadRequestException('User ID not found in request');
    }
    console.log('Creating order for userId:', userId);
    return this.ordersService.createOrder(orderData, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Get()
  listByUser(@Query('userId') userId: string, @Req() req: Request) {
    console.log('GET /orders - req.user:', req.user);
    console.log('GET /orders - userId param:', userId);
    return this.ordersService.listOrdersByUser(userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { orderStatus: string }) {
    return this.ordersService.updateOrderStatus(id, body.orderStatus);
  }

  @Patch(':id/payment')
  updatePayment(@Param('id') id: string, @Body() body: { paymentStatus: string }) {
    return this.ordersService.updatePaymentStatus(id, body.paymentStatus);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
