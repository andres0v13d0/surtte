import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { SubSubCategory } from './sub-sub-category.entity';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, category => category.subCategories, { onDelete: 'CASCADE' })
  category: Category;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => SubSubCategory, subSub => subSub.subCategory, { cascade: true })
  subSubCategories: SubSubCategory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
