import {
  IsUUID,
  IsString,
  MaxLength,
  IsDecimal,
  IsIn,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPriceDto {
  @IsUUID()
  productId: string;

  @IsString()
  @MaxLength(100)
  quantity: string;

  @IsOptional()
  @IsIn(['unidad', 'docena'], { message: 'La unidad debe ser "unidad" o "docena"' })
  unity?: string;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Debe tener máximo 2 decimales' })
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
