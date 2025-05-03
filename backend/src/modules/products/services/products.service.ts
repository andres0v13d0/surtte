import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Product, ProductStatus } from '../entities/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Provider } from '../../providers/entity/provider.entity';
import { Category } from '../../categories/entities/category.entity';
import { SubCategory } from '../../categories/entities/sub-category.entity';
import { Size } from '../../products/entities/size.entity';
import { Color } from '../../products/entities/color.entity';

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

    private readonly bucketName = 'surtte-product-images',
    private readonly cloudFrontUrl = 'https://cdn.surtte.com',
    private readonly s3 = new S3Client({ region: 'us-east-2' }),

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
  
    const colorEntities = await Promise.all(
      (dto.colors ?? []).map(async ({ name }) => {
        let color = await this.colorRepo.findOne({ where: { name } });
        if (!color) {
          color = this.colorRepo.create({ name });
          await this.colorRepo.save(color);
        }
        return color;
      })
    );
  
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
    reference: dto.reference?.trim(),
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
      relations: ['provider', 'category', 'subCategory', 'colors', 'sizes'],
    });

    if (!product) throw new NotFoundException('Producto no encontrado.');

    return product;
  }

  async findByProvider(providerId: number): Promise<Product[]> {
    return this.productRepo.find({
      where: { provider: { id: providerId } },
      relations: ['category', 'subCategory', 'provider'],
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
    product.reference = dto.reference?.trim();
  
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
  
    if (dto.colors) {
      const colorEntities = await Promise.all(
        dto.colors.map(async ({ name }) => {
          let color = await this.colorRepo.findOne({ where: { name } });
          if (!color) {
            color = this.colorRepo.create({ name });
            await this.colorRepo.save(color);
          }
          return color;
        }),
      );
      product.colors = colorEntities;
    }
  
    if (dto.sizes) {
      const sizeEntities = await Promise.all(
        dto.sizes.map(async ({ name }) => {
          let size = await this.sizeRepo.findOne({ where: { name } });
          if (!size) {
            size = this.sizeRepo.create({ name });
            await this.sizeRepo.save(size);
          }
          return size;
        }),
      );
      product.sizes = sizeEntities;
    }
  
    return this.productRepo.save(product);
  }
  
  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['images'],
    });
  
    if (!product) throw new NotFoundException('Producto no encontrado.');
  
    for (const image of product.images) {
      const key = image.imageUrl.replace(`${this.cloudFrontUrl}/`, '');
      try {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          })
        );
      } catch (err) {
        console.error(`Error al borrar imagen ${key} de S3`, err);
      }
    }
  
    await this.productRepo.remove(product);
  }
}
