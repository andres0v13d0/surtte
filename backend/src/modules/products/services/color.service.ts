import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from '../entities/color.entity';
import { CreateColorDto } from '../dtos/create-color.dto';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async create(createColorDto: CreateColorDto): Promise<Color> {
    const { name } = createColorDto;

    const existingColor = await this.colorRepository.findOne({
      where: [
        { name: name.toLowerCase() }
      ],
    });

    if (existingColor) {
      return existingColor;
    }

    const color = this.colorRepository.create({
      name: name.toLowerCase(),
    });

    return await this.colorRepository.save(color);
  }

  async findAll(): Promise<Color[]> {
    return await this.colorRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<Color | null> {
    return await this.colorRepository.findOne({
      where: { id },
    });
  }
}
