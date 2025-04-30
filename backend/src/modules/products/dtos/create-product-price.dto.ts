import {
  IsNotEmpty,
  IsUUID,
  IsString,
  MaxLength,
  IsDecimal,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPriceDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQuantity: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQuantity: number;

  @IsNotEmpty()
  @IsIn(['unidad', 'docena'], { message: 'La unidad debe ser "unidad" o "docena"' })
  unity: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Debe tener máximo 2 decimales' })
  price: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;
}

