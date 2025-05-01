import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

class ColorInput {
  @IsString()
  name: string;

  @IsString()
  hexCode: string;
}

class SizeInput {
  @IsString()
  name: string;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorInput)
  colors?: ColorInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeInput)
  sizes?: SizeInput[];
}

  
