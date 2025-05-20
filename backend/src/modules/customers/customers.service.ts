import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { User } from '../users/entity/user.entity';
import { Provider } from '../providers/entity/provider.entity';
import { CreateCustomerDto, FilterCustomersDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Provider) private readonly providerRepo: Repository<Provider>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    const existing = await this.customerRepo.findOne({
      where: { user: { id: user.id }, provider: { id: provider.id } },
    });

    if (existing) return existing;

    const customer = this.customerRepo.create({
      user,
      provider,
    });

    return this.customerRepo.save(customer);
  }

  async getCustomersOfProvider(providerId: number, filter?: FilterCustomersDto): Promise<Customer[]> {
    const query = this.customerRepo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.user', 'user')
      .where('customer.provider_id = :providerId', { providerId });

    if (filter?.searchName) {
      query.andWhere('LOWER(user.nombre) LIKE :name', {
        name: `%${filter.searchName.toLowerCase()}%`,
      });
    }

    if (filter?.startDate) {
      query.andWhere('customer.created_at >= :startDate', { startDate: filter.startDate });
    }

    if (filter?.endDate) {
      query.andWhere('customer.created_at <= :endDate', { endDate: filter.endDate });
    }

    return query.orderBy('customer.created_at', 'DESC').getMany();
  }

  async markAsExclusive(customerId: number, providerId: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
      relations: ['provider'],
    });

    if (!customer) throw new NotFoundException('Cliente no encontrado');
    if (customer.provider.id !== providerId) {
      throw new ForbiddenException('No puedes modificar un cliente que no es tuyo');
    }

    customer.isExclusive = true;
    return this.customerRepo.save(customer);
  }

  async removeExclusive(customerId: number, providerId: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
      relations: ['provider'],
    });

    if (!customer) throw new NotFoundException('Cliente no encontrado');
    if (customer.provider.id !== providerId) {
      throw new ForbiddenException('No puedes modificar un cliente que no es tuyo');
    }

    customer.isExclusive = false;
    return this.customerRepo.save(customer);
  }

  async createManual(dto: CreateCustomerDto): Promise<Customer> {
    const provider = await this.providerRepo.findOne({ where: { id: dto.providerId } });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    const existing = await this.customerRepo.findOne({
      where: {
        celular: dto.celular,
        provider: { id: dto.providerId },
      },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un cliente con ese número para este proveedor');
    }

    const customer = this.customerRepo.create({
      provider,
      user: null,
      nombre: dto.nombre.trim(),
      celular: dto.celular.trim(),
      direccion: dto.direccion.trim(),
      ciudad: dto.ciudad.trim(),
      departamento: dto.departamento.trim(),
    });

    return this.customerRepo.save(customer);
  }

}
