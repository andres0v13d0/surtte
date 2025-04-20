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
  
    @Column({ type: 'varchar', length: 100 })
    minQuantity: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    pricePerUnit: number;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  