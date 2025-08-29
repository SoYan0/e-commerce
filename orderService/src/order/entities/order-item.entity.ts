import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column()
  productId: number; // reference to Product Service

  @Column()
  productName: string; // snapshot at purchase time

  @Column('decimal', { precision: 12, scale: 2 })
  price: number; // snapshot price at purchase time

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;
}
