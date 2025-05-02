import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  priceSnapshot: number;

  @IsString()
  @IsOptional()
  colorSnapshot?: string;

  @IsString()
  @IsOptional()
  sizeSnapshot?: string;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsOptional()
  priceSnapshot?: number;
}

export class ToggleCheckDto {
  @IsBoolean()
  isChecked: boolean;
}
