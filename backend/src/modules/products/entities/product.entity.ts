import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Provider } from 'src/modules/providers/entity/provider.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { SubCategory } from 'src/modules/categories/entities/sub-category.entity';
import { ProductImage } from './product-image.entity';
import { ProductPrice } from './product-price.entity';
import { Color } from './color.entity';
import { CartItem } from 'src/modules/cart/entity/cart.entity';
import { Size } from './size.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Provider, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column()
  providerId: number;

  @ManyToOne(() => Category, { nullable: false })
  category: Category;

  @ManyToOne(() => SubCategory, { nullable: true })
  subCategory: SubCategory;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.PENDING,
  })
  status: ProductStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices: ProductPrice[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @ManyToMany(() => Color, (color) => color.products, { cascade: true })
  @JoinTable({
    name: 'product_colors',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'color_id', referencedColumnName: 'id' },
  })
  colors: Color[];

  @ManyToMany(() => Size, (size) => size.products, { cascade: true })
  @JoinTable({
    name: 'product_sizes',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'size_id', referencedColumnName: 'id' },
  })
  sizes: Size[];
}
