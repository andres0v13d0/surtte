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
import { SubCategoriesService } from '../services/sub-categories.service';
import { CreateSubCategoryDto } from '../dtos/create-sub-category.dto';

@Controller('sub-categories')
export class SubCategoriesController {
    constructor(private readonly subCategoriesService: SubCategoriesService) {}
    
    @Get('/with-image')
    getAllWithImage() {
        return this.subCategoriesService.getSubCategoriesWithImage();
    }

    @Post()
    create(@Body() dto: CreateSubCategoryDto) {
        return this.subCategoriesService.create(dto);
    }

    @Get()
    findAll() {
        return this.subCategoriesService.findAll();
    }

    @Get('/by-category/:categoryId')
    findByCategoryId(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
        return this.subCategoriesService.findByCategoryId(categoryId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.subCategoriesService.findOneById(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateSubCategoryDto,
    ) {
        return this.subCategoriesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.subCategoriesService.remove(id);
    }
}
