import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { SubSubCategory } from '../entities/sub-sub-category.entity';
import { SubCategory } from '../entities/sub-category.entity';
import { CreateSubSubCategoryDto } from '../dtos/create-sub-sub-category.dto';

@Injectable()
export class SubSubCategoriesService {
  constructor(
    @InjectRepository(SubSubCategory)
    private readonly subSubCategoryRepo: Repository<SubSubCategory>,

    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
  ) {}

  async create(dto: CreateSubSubCategoryDto): Promise<SubSubCategory> {
    const subCategory = await this.subCategoryRepo.findOne({ where: { id: dto.subCategoryId } });
    if (!subCategory) {
      throw new NotFoundException('Subcategoría no encontrada.');
    }

    const duplicate = await this.subSubCategoryRepo.findOne({
      where: {
        name: ILike(dto.name.trim()),
        subCategory: { id: dto.subCategoryId },
      },
      relations: ['subCategory'],
    });

    if (duplicate) {
      throw new ConflictException('Ya existe una sub-sub-categoría con ese nombre en esta subcategoría.');
    }

    const subSub = this.subSubCategoryRepo.create({
      name: dto.name.trim(),
      subCategory,
    });

    return this.subSubCategoryRepo.save(subSub);
  }

  async findAll(): Promise<SubSubCategory[]> {
    return this.subSubCategoryRepo.find({
      relations: ['subCategory'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findBySubCategoryId(subCategoryId: string): Promise<SubSubCategory[]> {
    return this.subSubCategoryRepo.find({
      where: {
        subCategory: { id: subCategoryId },
      },
      relations: ['subCategory'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOneById(id: string): Promise<SubSubCategory> {
    const subSub = await this.subSubCategoryRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
    if (!subSub) {
      throw new NotFoundException('Sub-sub-categoría no encontrada.');
    }
    return subSub;
  }

  async update(id: string, dto: CreateSubSubCategoryDto): Promise<SubSubCategory> {
    const subSub = await this.findOneById(id);

    const subCategory = await this.subCategoryRepo.findOne({ where: { id: dto.subCategoryId } });
    if (!subCategory) {
      throw new NotFoundException('Subcategoría no encontrada.');
    }

    const duplicate = await this.subSubCategoryRepo.findOne({
      where: {
        name: ILike(dto.name.trim()),
        subCategory: { id: dto.subCategoryId },
      },
      relations: ['subCategory'],
    });

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Ya existe una sub-sub-categoría con ese nombre en esa subcategoría.');
    }

    subSub.name = dto.name.trim();
    subSub.subCategory = subCategory;

    return this.subSubCategoryRepo.save(subSub);
  }

  async remove(id: string): Promise<void> {
    const subSub = await this.findOneById(id);
    await this.subSubCategoryRepo.remove(subSub);
  }
}
