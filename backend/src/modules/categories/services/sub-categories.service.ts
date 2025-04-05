import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { SubCategory } from '../entities/sub-category.entity';
import { Category } from '../entities/category.entity';
import { CreateSubCategoryDto } from '../dtos/create-sub-category.dto';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateSubCategoryDto): Promise<SubCategory> {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const duplicate = await this.subCategoryRepo.findOne({
      where: {
        name: ILike(dto.name.trim()),
        category: { id: dto.categoryId },
      },
      relations: ['category'],
    });

    if (duplicate) {
      throw new ConflictException('Ya existe una subcategoría con ese nombre en esta categoría.');
    }

    const subCategory = this.subCategoryRepo.create({
      name: dto.name.trim(),
      category,
    });

    return this.subCategoryRepo.save(subCategory);
  }

  async findAll(): Promise<SubCategory[]> {
    return this.subCategoryRepo.find({
      relations: ['category'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findByCategoryId(categoryId: string): Promise<SubCategory[]> {
    return this.subCategoryRepo.find({
      where: {
        category: { id: categoryId },
      },
      relations: ['category'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOneById(id: string): Promise<SubCategory> {
    const sub = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!sub) {
      throw new NotFoundException('Subcategoría no encontrada.');
    }
    return sub;
  }

  async update(id: string, dto: CreateSubCategoryDto): Promise<SubCategory> {
    const subCategory = await this.findOneById(id);

    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const duplicate = await this.subCategoryRepo.findOne({
      where: {
        name: ILike(dto.name.trim()),
        category: { id: dto.categoryId },
      },
      relations: ['category'],
    });

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Ya existe una subcategoría con ese nombre en esa categoría.');
    }

    subCategory.name = dto.name.trim();
    subCategory.category = category;

    return this.subCategoryRepo.save(subCategory);
  }

  async remove(id: string): Promise<void> {
    const subCategory = await this.findOneById(id);

    const hasChildren = await this.subCategoryRepo
      .createQueryBuilder('sc')
      .leftJoin('sc.subSubCategories', 'ssc')
      .where('sc.id = :id', { id })
      .andWhere('ssc.id IS NOT NULL')
      .getOne();

    if (hasChildren) {
      throw new ConflictException('No se puede eliminar una subcategoría con sub-subcategorías asociadas.');
    }

    await this.subCategoryRepo.remove(subCategory);
  }
}
