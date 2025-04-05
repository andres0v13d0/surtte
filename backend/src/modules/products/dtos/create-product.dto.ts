import {
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    IsOptional,
    IsEnum,
    IsUUID,
  } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';
  
export class CreateProductDto {
    @IsNotEmpty()
    @IsNumber()
    providerId: number;
  
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;
  
    @IsNotEmpty()
    @IsString()
    description: string;
  
    @IsNotEmpty()
    @IsUUID()
    categoryId: string;
  
    @IsOptional()
    @IsUUID()
    subCategoryId?: string;
  
    @IsOptional()
    @IsUUID()
    subSubCategoryId?: string;
  
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}
  