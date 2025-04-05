import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dtos/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({
      where: { name: ILike(createCategoryDto.name.trim()) },
    });

    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre.');
    }

    const newCategory = this.categoryRepo.create({
      name: createCategoryDto.name.trim(),
    });

    return this.categoryRepo.save(newCategory);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }
    return category;
  }

  async update(id: string, dto: CreateCategoryDto): Promise<Category> {
    const category = await this.findOneById(id);

    const duplicate = await this.categoryRepo.findOne({
      where: {
        name: ILike(dto.name.trim()),
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Ya existe otra categoría con ese nombre.');
    }

    category.name = dto.name.trim();
    return this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOneById(id);

    const hasChildren = await this.categoryRepo
      .createQueryBuilder('c')
      .leftJoin('c.subCategories', 'sc')
      .where('c.id = :id', { id })
      .andWhere('sc.id IS NOT NULL')
      .getOne();

    if (hasChildren) {
      throw new ConflictException('No se puede eliminar una categoría con subcategorías asociadas.');
    }

    await this.categoryRepo.remove(category);
  }

  async findWithSubCategories(): Promise<Category[]> {
    return this.categoryRepo.find({
      relations: ['subCategories'],
      order: {
        name: 'ASC',
        subCategories: {
          name: 'ASC',
        },
      },
    });
  }
}
