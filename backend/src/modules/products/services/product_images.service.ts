import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ProductImage } from '../entities/product-image.entity';
import { GenerateSignedUrlDto } from '../dtos/generate-signed-url.dto';
import { RegisterImageDto } from '../dtos/register-image.dto';
import { Product } from '../entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductImagesService {
  private readonly bucketName = 'surtte-product-images';
  private readonly region = 'us-east-2';
  private readonly cloudFrontUrl = 'https://cdn.surtte.com';

  private readonly s3 = new S3Client({ region: this.region });

  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async generateSignedUrl(dto: GenerateSignedUrlDto): Promise<{ signedUrl: string; finalUrl: string }> {
    if (dto.productId) {
      const product = await this.productRepo.findOne({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Producto no encontrado.');
    }

    const extension = dto.filename.split('.').pop();
    const key = `uploads/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: dto.mimeType,
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 minutos

    const finalUrl = `${this.cloudFrontUrl}/${key}`;

    return { signedUrl, finalUrl };
  }

  async registerImage(dto: RegisterImageDto): Promise<ProductImage> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const newImage = this.imageRepo.create({
      product,
      imageUrl: dto.imageUrl,
      temporal: dto.temporal,
    });

    return this.imageRepo.save(newImage);
  }

  async findByProduct(productId: string): Promise<ProductImage[]> {
    return this.imageRepo.find({
      where: { product: { id: productId } },
      order: { createdAt: 'ASC' },
    });
  }

  async deleteImage(id: string): Promise<void> {
    const img = await this.imageRepo.findOne({ where: { id } });
    if (!img) throw new NotFoundException('Imagen no encontrada.');

    await this.imageRepo.remove(img);
  }
}
