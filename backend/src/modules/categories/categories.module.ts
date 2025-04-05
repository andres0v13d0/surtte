import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { SubSubCategory } from './entities/sub-sub-category.entity';
import { CategoriesService } from './services/categories.service';
import { SubCategoriesService } from './services/sub-categories.service';
import { SubSubCategoriesService } from './services/sub-sub-categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { SubCategoriesController } from './controllers/sub-categories.controller';
import { SubSubCategoriesController } from './controllers/sub-sub-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory, SubSubCategory])],
  controllers: [CategoriesController, SubCategoriesController, SubSubCategoriesController],
  providers: [CategoriesService, SubCategoriesService, SubSubCategoriesService],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
