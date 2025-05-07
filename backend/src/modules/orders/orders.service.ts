import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  CreateOrderDto,
  UpdateOrderDto,
  FilterOrdersDto,
} from './dto/order.dto';
import { User } from '../users/entity/user.entity';
import { Provider } from '../providers/entity/provider.entity';
import { Customer } from '../customers/entity/customer.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Provider) private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    if (!dto.items?.length) throw new BadRequestException('El pedido debe tener al menos un producto');

    const items: OrderItem[] = dto.items.map((item) => {
      const orderItem = this.itemRepo.create({ ...item });
      return orderItem;
    });

    const total = dto.totalPrice ?? items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const order = this.orderRepo.create({
      user,
      provider,
      items,
      totalPrice: total,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
    });

    return this.orderRepo.save(order);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByProvider(providerId: number): Promise<Order[]> {
    const provider = await this.providerRepo.findOne({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    return this.orderRepo.find({
      where: { provider: { id: providerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.getOrderById(id);

    if (dto.status) {
      order.status = dto.status;

      if (dto.status === OrderStatus.DELIVERED) {
        const exists = await this.customerRepo.findOne({
          where: {
            user: { id: order.user.id },
            provider: { id: order.provider.id },
          },
        });

        if (!exists) {
          const newCustomer = this.customerRepo.create({
            user: order.user,
            provider: order.provider,
          });
          await this.customerRepo.save(newCustomer);
        }
      }
    }

    if (dto.shippingAddress) order.shippingAddress = dto.shippingAddress;
    if (dto.notes) order.notes = dto.notes;

    return this.orderRepo.save(order);
  }

  async filter(dto: FilterOrdersDto): Promise<Order[]> {
    const query = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.provider', 'provider')
      .leftJoinAndSelect('order.items', 'items');

    if (dto.userId) query.andWhere('user.id = :userId', { userId: dto.userId });
    if (dto.providerId) query.andWhere('provider.id = :providerId', { providerId: dto.providerId });
    if (dto.status) query.andWhere('order.status = :status', { status: dto.status });
    if (dto.startDate) query.andWhere('order.createdAt >= :startDate', { startDate: dto.startDate });
    if (dto.endDate) query.andWhere('order.createdAt <= :endDate', { endDate: dto.endDate });

    return query.orderBy('order.createdAt', 'DESC').getMany();
  }
}
