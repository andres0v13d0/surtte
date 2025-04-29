import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ColorService } from '../services/color.service';
import { CreateColorDto } from '../dtos/create-color.dto';
import { Color } from '../entities/color.entity';

@Controller('colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Post()
  async create(@Body() createColorDto: CreateColorDto): Promise<Color> {
    return await this.colorService.create(createColorDto);
  }


  @Get()
  async findAll(): Promise<Color[]> {
    return await this.colorService.findAll();
  }


  @Get(':id')
  async findById(@Param('id') id: string): Promise<Color> {
    const color = await this.colorService.findById(id);

    if (!color) {

      return null;
    }

    return color;
  }
}
