import { Module } from '@nestjs/common';
import { CategoriesController } from './categories/categories.controller';
import { SubCategoriesController } from './sub-categories/sub-categories.controller';

@Module({
  controllers: [CategoriesController, SubCategoriesController]
})
export class CategoriesModule {}
