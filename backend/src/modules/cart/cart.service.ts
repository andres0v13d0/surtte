import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart.entity';
import {
  CreateCartItemDto,
  UpdateCartItemDto,
  ToggleCheckDto,
} from './dto/cart.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entity/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAllByUser(userId: number, onlyChecked = false): Promise<CartItem[]> {
    return this.cartRepo.find({
      where: {
        user: { id: userId },
        ...(onlyChecked ? { isChecked: true } : {}),
      },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async countCheckedItems(userId: number): Promise<number> {
    return this.cartRepo.count({
      where: {
        user: { id: userId },
        isChecked: true,
      },
    });
  }

  async addOrUpdateItem(user: User, dto: CreateCartItemDto): Promise<CartItem> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
      relations: ['provider', 'images', 'prices'],
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const existingItem = await this.cartRepo.findOne({
      where: {
        user: { id: user.id },
        product: { id: dto.productId },
        colorSnapshot: dto.colorSnapshot || null,
        sizeSnapshot: dto.sizeSnapshot || null,
      },
    });

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      return this.cartRepo.save(existingItem);
    }

    const newItem = this.cartRepo.create({
      user,
      product,
      productId: product.id,
      quantity: dto.quantity,
      colorSnapshot: dto.colorSnapshot || null,
      sizeSnapshot: dto.sizeSnapshot || null,
      productNameSnapshot: product.name,
      imageUrlSnapshot: product.images?.[0]?.imageUrl || '/camiseta.avif',
      providerNameSnapshot: product.provider.nombre_empresa,
      priceSnapshot: dto.priceSnapshot,
      isChecked: true,
    });

    return this.cartRepo.save(newItem);
  }

  async updateQuantity(itemId: string, dto: UpdateCartItemDto, user: User): Promise<CartItem> {
    const item = await this.getUserItemOrThrow(itemId, user.id);
    item.quantity = dto.quantity;

    // Solo actualizas el precio si se pasó uno nuevo
    if (dto.priceSnapshot !== undefined) {
      item.priceSnapshot = dto.priceSnapshot;
    }

    return this.cartRepo.save(item);
  }

  async toggleCheck(itemId: string, dto: ToggleCheckDto, user: User): Promise<CartItem> {
    const item = await this.getUserItemOrThrow(itemId, user.id);
    item.isChecked = dto.isChecked;
    return this.cartRepo.save(item);
  }

  async deleteItem(itemId: string, user: User): Promise<void> {
    const item = await this.getUserItemOrThrow(itemId, user.id);
    await this.cartRepo.remove(item);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepo.delete({ user: { id: userId } });
  }

  async getSelectedItems(userId: number): Promise<CartItem[]> {
    return this.findAllByUser(userId, true);
  }

  private async getUserItemOrThrow(itemId: string, userId: number): Promise<CartItem> {
    const item = await this.cartRepo.findOne({
      where: { id: itemId, user: { id: userId } },
    });

    if (!item) throw new NotFoundException('Ítem no encontrado en tu carrito');

    return item;
  }
}
