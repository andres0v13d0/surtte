import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoriteDto } from './dto/favorite.dto';
import { Favorite } from './entity/favorite.entity';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async addFavorite(@Body() favoriteDto: FavoriteDto): Promise<Favorite> {
    return await this.favoritesService.addFavorite(favoriteDto);
  }

  @Delete(':userId/:productId')
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    await this.favoritesService.removeFavorite(Number(userId), productId);
    return { message: 'Producto eliminado de favoritos' };
  }

  @Get(':userId')
  async getFavoritesByUser(@Param('userId') userId: string): Promise<Favorite[]> {
    return await this.favoritesService.findFavoritesByUser(Number(userId));
  }
}
