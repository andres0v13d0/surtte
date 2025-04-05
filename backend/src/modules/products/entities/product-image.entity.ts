import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Product } from './product.entity';
  
  @Entity('product_images')
  export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Product, (product) => product.images, {
      nullable: false,
      onDelete: 'CASCADE',
    })
    product: Product;
  
    @Column({ type: 'varchar', length: 500 })
    imageUrl: string;
  
    @Column({ default: true })
    temporal: boolean;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  