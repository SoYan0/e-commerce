import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'float', nullable: true })
  discountPercentage?: number;

  @Column({ type: 'float', nullable: true })
  discountedPrice?: number;

  @Column({ type: 'timestamp', nullable: true })
  discountExpiresAt?: Date;

  @Column()
  stock: number;

  @Column({ type: 'text', array: true })
  categories: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
