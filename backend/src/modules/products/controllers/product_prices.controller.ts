import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { ProductPricesService } from '../services/product_prices.service';
  import { CreateProductPriceDto } from '../dtos/create-product-price.dto';
  
  @Controller('product-prices')
  export class ProductPricesController {
    constructor(private readonly productPricesService: ProductPricesService) {}
  
    @Post()
    create(@Body() dto: CreateProductPriceDto) {
      return this.productPricesService.create(dto);
    }
  
    @Get('product/:productId')
    findByProduct(
      @Param('productId', ParseUUIDPipe) productId: string,
    ) {
      return this.productPricesService.findByProductId(productId);
    }
  
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.productPricesService.findOne(id);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.productPricesService.remove(id);
    }
  }
  