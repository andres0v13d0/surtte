import { IsUUID } from 'class-validator';

export class FavoriteDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  productId: string;
}
