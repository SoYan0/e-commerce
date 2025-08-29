import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from './entities/order-status.enum';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  private validateUUID(id: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    return id;
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const validatedId = this.validateUUID(id);
    return this.service.findById(validatedId);
  }

  @Get()
  listByUser(@Query('userId') userId: string) {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      throw new Error('Invalid userId parameter');
    }
    return this.service.listByUser(numericUserId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const validatedId = this.validateUUID(id);
    return this.service.updateOrderStatus(validatedId, dto.orderStatus as OrderStatus);
  }

  @Patch(':id/payment')
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    const validatedId = this.validateUUID(id);
    return this.service.updatePaymentStatus(validatedId, dto.paymentStatus as PaymentStatus);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    const validatedId = this.validateUUID(id);
    return this.service.cancelOrder(validatedId);
  }
}
