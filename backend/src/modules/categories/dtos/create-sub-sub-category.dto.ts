import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateSubSubCategoryDto {
  @IsNotEmpty()
  @IsUUID()
  subCategoryId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}
