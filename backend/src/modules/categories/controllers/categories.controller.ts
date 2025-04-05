import {
    Controller,
    Post,
    Get,
    Param,
    Patch,
    Delete,
    Body,
    ParseUUIDPipe,
  } from '@nestjs/common';
  import { CategoriesService } from '../services/categories.service';
  import { CreateCategoryDto } from '../dtos/create-category.dto';
  
  @Controller('categories')
  export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
  
    @Post()
    create(@Body() dto: CreateCategoryDto) {
      return this.categoriesService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.categoriesService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.categoriesService.findOneById(id);
    }
  
    @Patch(':id')
    update(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Body() dto: CreateCategoryDto,
    ) {
      return this.categoriesService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.categoriesService.remove(id);
    }
  
    @Get('/with/sub-categories')
    findWithSubCategories() {
      return this.categoriesService.findWithSubCategories();
    }
  }
  