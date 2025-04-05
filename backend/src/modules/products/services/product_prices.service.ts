import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductPrice } from '../entities/product-price.entity';
import { CreateProductPriceDto } from '../dtos/create-product-price.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductPricesService {
  constructor(
    @InjectRepository(ProductPrice)
    private readonly priceRepo: Repository<ProductPrice>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductPriceDto): Promise<ProductPrice> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const existing = await this.priceRepo.findOne({
      where: {
        product: { id: dto.productId },
        minQuantity: dto.minQuantity,
      },
      relations: ['product'],
    });

    if (existing) {
      throw new ConflictException('Ya existe un precio para esa cantidad mínima.');
    }

    const newPrice = this.priceRepo.create({
      product,
      minQuantity: dto.minQuantity,
      pricePerUnit: dto.pricePerUnit,
    });

    return this.priceRepo.save(newPrice);
  }

  async findByProductId(productId: string): Promise<ProductPrice[]> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    return this.priceRepo.find({
      where: { product: { id: productId } },
      order: { minQuantity: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProductPrice> {
    const price = await this.priceRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!price) throw new NotFoundException('Precio no encontrado.');
    return price;
  }

  async remove(id: string): Promise<void> {
    const price = await this.findOne(id);
    await this.priceRepo.remove(price);
  }
}
