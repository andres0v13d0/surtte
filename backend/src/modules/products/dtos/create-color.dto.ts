import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^#([0-9a-fA-F]{6})$/, {
    message: 'hexCode must be a valid hexadecimal color code',
  })
  hexCode: string;
}
