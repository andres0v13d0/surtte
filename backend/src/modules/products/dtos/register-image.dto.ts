import { IsNotEmpty, IsString, IsUUID, IsBoolean } from 'class-validator';

export class RegisterImageDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsBoolean()
  temporal: boolean;
}
