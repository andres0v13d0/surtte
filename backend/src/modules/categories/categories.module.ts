import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { CategoriesService } from './services/categories.service';
import { SubCategoriesService } from './services/sub-categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { SubCategoriesController } from './controllers/sub-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory])],
  controllers: [CategoriesController, SubCategoriesController],
  providers: [CategoriesService, SubCategoriesService],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
