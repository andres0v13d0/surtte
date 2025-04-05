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
import { SubSubCategoriesService } from '../services/sub-sub-categories.service';
import { CreateSubSubCategoryDto } from '../dtos/create-sub-sub-category.dto';

@Controller('sub-sub-categories')
export class SubSubCategoriesController {
    constructor(private readonly subSubCategoriesService: SubSubCategoriesService) {}

    @Post()
    create(@Body() dto: CreateSubSubCategoryDto) {
        return this.subSubCategoriesService.create(dto);
    }

    @Get()
    findAll() {
        return this.subSubCategoriesService.findAll();
    }

    @Get('/by-sub-category/:subCategoryId')
    findBySubCategoryId(@Param('subCategoryId', ParseUUIDPipe) subCategoryId: string) {
        return this.subSubCategoriesService.findBySubCategoryId(subCategoryId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.subSubCategoriesService.findOneById(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateSubSubCategoryDto,
    ) {
        return this.subSubCategoriesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.subSubCategoriesService.remove(id);
    }
}
