import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SizeService } from '../services/size.service';
import { CreateSizeDto } from '../dtos/create-size.dto';
import { Size } from '../entities/size.entity';

@Controller('sizes')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Post()
  async create(@Body() createSizeDto: CreateSizeDto): Promise<Size> {
    return await this.sizeService.create(createSizeDto);
  }

  @Get()
  async findAll(): Promise<Size[]> {
    return await this.sizeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Size> {
    const size = await this.sizeService.findById(id);

    if (!size) {
      return null;
    }

    return size;
  }
}
