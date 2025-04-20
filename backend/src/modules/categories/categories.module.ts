import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { Product } from '../products/entities/product.entity';
import { CategoriesService } from './services/categories.service';
import { SubCategoriesService } from './services/sub-categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { SubCategoriesController } from './controllers/sub-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory, Product])],
  controllers: [CategoriesController, SubCategoriesController],
  providers: [CategoriesService, SubCategoriesService],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
