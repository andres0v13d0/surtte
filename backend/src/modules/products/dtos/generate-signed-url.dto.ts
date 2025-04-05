import { IsNotEmpty, IsString, IsMimeType, IsUUID, IsOptional } from 'class-validator';

export class GenerateSignedUrlDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsMimeType()
  mimeType: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}
