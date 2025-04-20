import { IsNotEmpty, IsUUID, IsString, MaxLength, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPriceDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  minQuantity: string;


  @IsNotEmpty()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Debe tener máximo 2 decimales' })
  pricePerUnit: number;
}
