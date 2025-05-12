import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './controllers/products.controller';
import { ProductPricesController } from './controllers/product_prices.controller';
import { ProductImagesController } from './controllers/product_images.controller';
import { ColorController } from './controllers/color.controller';
import { SizeController } from './controllers/size.controller';

import { ProductsService } from './services/products.service';
import { ProductPricesService } from './services/product_prices.service';
import { ProductImagesService } from './services/product_images.service';
import { ColorService } from './services/color.service';
import { SizeService } from './services/size.service';

import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductImage } from './entities/product-image.entity';
import { Color } from './entities/color.entity';
import { Size } from './entities/size.entity';

import { Provider } from '../providers/entity/provider.entity';
import { Category } from '../categories/entities/category.entity';
import { SubCategory } from '../categories/entities/sub-category.entity';

import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductPrice,
      ProductImage,
      Color,
      Size,
      Provider,
      Category,
      SubCategory,
    ]),
    SubscriptionsModule,
  ],
  controllers: [
    ProductsController,
    ProductPricesController,
    ProductImagesController,
    ColorController,
    SizeController, 
  ],
  providers: [
    ProductsService,
    ProductPricesService,
    ProductImagesService,
    ColorService,
    SizeService,
  ],
})
export class ProductsModule {}
