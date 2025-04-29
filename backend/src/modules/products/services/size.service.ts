import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Size } from '../entities/size.entity';
import { CreateSizeDto } from '../dtos/create-size.dto';

@Injectable()
export class SizeService {
  constructor(
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
  ) {}

  async create(createSizeDto: CreateSizeDto): Promise<Size> {
    const { name } = createSizeDto;

    const existingSize = await this.sizeRepository.findOne({
      where: { name: name.toUpperCase() },
    });

    if (existingSize) {
      return existingSize;
    }

    const size = this.sizeRepository.create({
      name: name.toUpperCase(), 
    });

    return await this.sizeRepository.save(size);
  }

  async findAll(): Promise<Size[]> {
    return await this.sizeRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<Size | null> {
    return await this.sizeRepository.findOne({
      where: { id },
    });
  }
}
