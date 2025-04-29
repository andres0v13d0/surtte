import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entity/favorite.entity';
import { FavoriteDto } from './dto/favorite.dto';
import { User } from '../users/entity/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addFavorite(favoriteDto: FavoriteDto): Promise<Favorite> {
    const { userId, productId } = favoriteDto;

    const userIdNumber = Number(userId);

    const user = await this.userRepository.findOne({ where: { id: userIdNumber } });
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!user || !product) {
      throw new Error('Usuario o Producto no encontrado');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userIdNumber },
        product: { id: productId },
      },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    const favorite = this.favoriteRepository.create({
      user,
      product,
    });

    return await this.favoriteRepository.save(favorite);
  }

  async removeFavorite(userId: number, productId: string): Promise<void> {
    await this.favoriteRepository.delete({
      user: { id: userId },
      product: { id: productId },
    });
  }

  async findFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
