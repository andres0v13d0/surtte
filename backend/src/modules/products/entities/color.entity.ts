import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ManyToMany(() => Product, (product) => product.colors)
  products: Product[];
}
