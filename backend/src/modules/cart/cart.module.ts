import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entity/cart.entity';
import { Product } from '../products/entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Product]),
    UsersModule
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
