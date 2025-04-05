import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SubCategory } from './sub-category.entity';

@Entity('sub_sub_categories')
export class SubSubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubCategory, subCategory => subCategory.subSubCategories, { onDelete: 'CASCADE' })
  subCategory: SubCategory;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
