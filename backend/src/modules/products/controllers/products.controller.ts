import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    Query,
    ParseUUIDPipe,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ProductsService } from '../services/products.service';
  import { CreateProductDto } from '../dtos/create-product.dto';
  import { ProductStatus } from '../entities/product.entity';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Post()
    create(@Body() dto: CreateProductDto) {
      return this.productsService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.productsService.findAll();
    }
  
    @Get('/public')
    getPublicProducts() {
      return this.productsService.getPublicProducts();
    }
  
    @Get('/:id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.productsService.findOneById(id);
    }
  
    @Get('/by-provider/:providerId')
    findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
      return this.productsService.findByProvider(providerId);
    }
  
    @Get('/search/:text')
    search(@Param('text') text: string) {
      return this.productsService.searchByText(text);
    }
  
    @Get('/filter')
    filter(
      @Query('categoryId', ParseUUIDPipe) categoryId?: string,
      @Query('subCategoryId') subCategoryId?: string,
    ) {
      return this.productsService.filterByCategory(categoryId, subCategoryId);
    }
  
    @Patch('/:id/status')
    updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('status') status: ProductStatus,
    ) {
      return this.productsService.updateStatus(id, status);
    }
  
    @Patch('/:id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: CreateProductDto,
    ) {
      return this.productsService.update(id, dto);
    }
  
    @Delete('/:id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.productsService.remove(id);
    }
  }
  