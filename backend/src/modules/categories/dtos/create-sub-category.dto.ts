import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateSubCategoryDto {
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}
