import { IsNotEmpty, IsUUID, IsInt, Min, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPriceDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minQuantity: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Debe tener máximo 2 decimales' })
  pricePerUnit: number;
}
