import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'int', nullable: true })
  minQuantity: number;

  @Column({ type: 'int', nullable: true })
  maxQuantity: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unity: string; // 'unidad' o 'docena'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
