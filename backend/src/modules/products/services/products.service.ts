import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Provider } from '../../providers/entity/provider.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { SubCategory } from 'src/modules/categories/entities/sub-category.entity';
import {  }

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,

    @InjectRepository(Color)
    private readonly colorRepo: Repository<Color>,
    
    @InjectRepository(Size)
    private readonly sizeRepo: Repository<Size>,

  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
  const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
  if (!provider) throw new NotFoundException('Proveedor no encontrado.');

  const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
  if (!category) throw new NotFoundException('Categoría no encontrada.');

  let subCategory = null;
  if (dto.subCategoryId) {
    subCategory = await this.subCategoryRepo.findOne({
      where: { id: dto.subCategoryId },
    });
    if (!subCategory) throw new NotFoundException('Subcategoría no encontrada.');
  }

  // Manejar colores
  const colorEntities = await Promise.all(
    (dto.colors ?? []).map(async ({ name, hexCode }) => {
      let color = await this.colorRepo.findOne({ where: { name } });
      if (!color) {
        color = this.colorRepo.create({ name, hexCode });
        await this.colorRepo.save(color);
      }
      return color;
    })
  );

  // Manejar tallas
  const sizeEntities = await Promise.all(
    (dto.sizes ?? []).map(async ({ name }) => {
      let size = await this.sizeRepo.findOne({ where: { name } });
      if (!size) {
        size = this.sizeRepo.create({ name });
        await this.sizeRepo.save(size);
      }
      return size;
    })
  );

  const newProduct = this.productRepo.create({
    provider,
    name: dto.name.trim(),
    description: dto.description.trim(),
    category,
    subCategory,
    status: dto.status || ProductStatus.ACTIVE,
    colors: colorEntities,
    sizes: sizeEntities,
  });

  return this.productRepo.save(newProduct);
}


  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['provider', 'category', 'subCategory'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['provider', 'category', 'subCategory'],
    });

    if (!product) throw new NotFoundException('Producto no encontrado.');

    return product;
  }

  async findByProvider(providerId: number): Promise<Product[]> {
    return this.productRepo.find({
      where: { provider: { id: providerId } },
      relations: ['category', 'subCategory'],
      order: { createdAt: 'DESC' },
    });
  }

  async searchByText(text: string): Promise<Product[]> {
    return this.productRepo.find({
      where: [
        { name: ILike(`%${text}%`) },
        { description: ILike(`%${text}%`) },
      ],
      relations: ['category', 'subCategory'],
    });
  }

  async filterByCategory(
    categoryId?: string,
    subCategoryId?: string,
  ): Promise<Product[]> {
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.provider', 'provider')
      .leftJoinAndSelect('product.prices', 'prices')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: 'active' });
  
    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }
    
    if (subCategoryId) {
      qb.andWhere('subCategory.id = :subCategoryId', { subCategoryId });
    }
      
  
    return qb.orderBy('product.createdAt', 'DESC').getMany();
  }

  async findBySlug(
    categorySlug?: string,
    subCategorySlug?: string,
  ): Promise<Product[]> {
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.provider', 'provider')
      .leftJoinAndSelect('product.prices', 'prices')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: 'active' });

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (subCategorySlug) {
      qb.andWhere('subCategory.slug = :subCategorySlug', { subCategorySlug });
    }

    return qb.orderBy('product.createdAt', 'DESC').getMany();
  }

  async getPublicProducts(): Promise<Product[]> {
    return this.productRepo.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ['category', 'subCategory', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    const product = await this.findOneById(id);
    product.status = status;
    return this.productRepo.save(product);
  }

  async update(id: string, dto: CreateProductDto): Promise<Product> {
    const product = await this.findOneById(id);

    product.name = dto.name.trim();
    product.description = dto.description.trim();

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Categoría no encontrada.');
      product.category = category;
    }

    if (dto.subCategoryId) {
      const subCategory = await this.subCategoryRepo.findOne({ where: { id: dto.subCategoryId } });
      if (!subCategory) throw new NotFoundException('Subcategoría no encontrada.');
      product.subCategory = subCategory;
    } else {
      product.subCategory = null;
    }

    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOneById(id);
    await this.productRepo.remove(product);
  }
}
