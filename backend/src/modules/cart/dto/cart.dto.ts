import { IsBoolean, IsInt, IsNotEmpty, IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  unitType: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  priceSnapshot: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ToggleCheckDto {
  @IsBoolean()
  isChecked: boolean;
}