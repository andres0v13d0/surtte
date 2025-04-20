import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './controllers/products.controller';
import { ProductPricesController } from './controllers/product_prices.controller';
import { ProductImagesController } from './controllers/product_images.controller';

import { ProductsService } from './services/products.service';
import { ProductPricesService } from './services/product_prices.service';
import { ProductImagesService } from './services/product_images.service';

import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductImage } from './entities/product-image.entity';

import { Provider } from '../providers/entity/provider.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { SubCategory } from 'src/modules/categories/entities/sub-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductPrice,
      ProductImage,
      Provider,
      Category,
      SubCategory,
    ]),
  ],
  controllers: [
    ProductsController,
    ProductPricesController,
    ProductImagesController, 
  ],
  providers: [
    ProductsService,
    ProductPricesService,
    ProductImagesService,
  ],
})
export class ProductsModule {}
