import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { ProductImagesService } from '../services/product_images.service';
  import { GenerateSignedUrlDto } from '../dtos/generate-signed-url.dto';
  import { RegisterImageDto } from '../dtos/register-image.dto';
  
  @Controller('images')
  export class ProductImagesController {
    constructor(private readonly productImagesService: ProductImagesService) {}
  
    @Post('signed-url')
    generateSignedUrl(@Body() dto: GenerateSignedUrlDto) {
      return this.productImagesService.generateSignedUrl(dto);
    }
  
    @Post('register')
    registerImage(@Body() dto: RegisterImageDto) {
      return this.productImagesService.registerImage(dto);
    }
  
    @Get('by-product/:productId')
    getImagesByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
      return this.productImagesService.findByProduct(productId);
    }
  
    @Delete(':id')
    deleteImage(@Param('id', ParseUUIDPipe) id: string) {
      return this.productImagesService.deleteImage(id);
    }
  }
  