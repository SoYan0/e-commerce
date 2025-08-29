import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from './entities/order-status.enum';
import { ProductsClient } from './products.client';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    private readonly productsClient: ProductsClient,
  ) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 90000) + 10000; // 5 digits
    return `ORD-${yyyy}${mm}${dd}-${rand}`;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('Items required');
    }

    // 1) Fetch product snapshots
    const ids = dto.items.map((i) => i.productId);
    const snapshots = await this.productsClient.getProductsByIds(ids);

    // quick map for lookup
    const snapMap = new Map(snapshots.map((p) => [p.id, p]));

    // 2) Validate existence & build order items with price/name snapshot
    const items = dto.items.map((i) => {
      const snap = snapMap.get(i.productId);
      if (!snap) {
        throw new BadRequestException(`Product not found: ${i.productId}`);
      }
      if (typeof snap.price !== 'number') {
        throw new BadRequestException(`Invalid price for product: ${i.productId}`);
      }
      const subtotal = Number((snap.price * i.quantity).toFixed(2));
      const item = new OrderItem();
      item.productId = snap.id; // Use numeric ID directly
      item.productName = snap.name;
      item.price = snap.price;
      item.quantity = i.quantity;
      item.subtotal = subtotal;
      return item;
    });

    const subtotal = items.reduce((acc, it) => acc + Number(it.subtotal), 0);
    const shipping = dto.shippingCost ?? 0;
    const discount = dto.discount ?? 0;
    const total = Number((subtotal + shipping - discount).toFixed(2));

    // 3) Create order with transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the order
      const order = new Order();
      order.orderNumber = this.generateOrderNumber();
      order.userId = dto.userId; // Use numeric ID directly
      order.subtotal = subtotal;
      order.shippingCost = shipping;
      order.discount = discount;
      order.total = total;
      order.shippingAddress = dto.shippingAddress;
      order.paymentStatus = dto.initialPaymentStatus || PaymentStatus.PENDING;
      order.orderStatus = OrderStatus.PENDING;

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items
      const orderItems = items.map(item => {
        item.order = savedOrder;
        return item;
      });

      await queryRunner.manager.save(OrderItem, orderItems);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return the complete order with items
      return await this.orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: ['items'],
      });

    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async listByUser(userId: number): Promise<Order[]> {
    return await this.orderRepo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(id: string, orderStatus: OrderStatus): Promise<Order> {
    const order = await this.findById(id);
    
    // Validate status transition
    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update status of cancelled order');
    }

    if (order.orderStatus === OrderStatus.DELIVERED && orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot change status of delivered order');
    }

    order.orderStatus = orderStatus;
    return await this.orderRepo.save(order);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.findById(id);
    
    // Validate payment status transition
    if (order.paymentStatus === PaymentStatus.REFUNDED && paymentStatus !== PaymentStatus.REFUNDED) {
      throw new BadRequestException('Cannot change status of refunded order');
    }

    order.paymentStatus = paymentStatus;
    
    // Update order status based on payment status
    if (paymentStatus === PaymentStatus.PAID && order.orderStatus === OrderStatus.PENDING) {
      order.orderStatus = OrderStatus.PROCESSING;
    }

    return await this.orderRepo.save(order);
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.findById(id);
    
    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.orderStatus === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.orderStatus === OrderStatus.SHIPPED) {
      throw new BadRequestException('Cannot cancel shipped order');
    }

    order.orderStatus = OrderStatus.CANCELLED;
    
    // If payment was made, consider refund logic here
    if (order.paymentStatus === PaymentStatus.PAID) {
      order.paymentStatus = PaymentStatus.REFUNDED;
    }

    return await this.orderRepo.save(order);
  }
}
