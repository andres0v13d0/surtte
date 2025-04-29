import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('favorites')
@Unique(['user', 'product'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
