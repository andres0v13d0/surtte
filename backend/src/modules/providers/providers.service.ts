import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entity/provider.entity';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';
import { User, RolUsuario } from '../users/entity/user.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const { usuario_id, rut } = createProviderDto;

    const user = await this.userRepository.findOne({ where: { id: usuario_id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${usuario_id} no encontrado`);
    }

    if (user.rol === RolUsuario.PROVEEDOR) {
      throw new ConflictException(`El usuario con ID ${usuario_id} ya es proveedor`);
    }

    const existingProvider = await this.providerRepository.findOne({ where: { rut } });
    if (existingProvider) {
      throw new ConflictException(`El RUT ${rut} ya está registrado en otro proveedor`);
    }

    const provider = this.providerRepository.create({
      ...createProviderDto,
      usuario: user,
      estadoVerificacion: 'pendiente',
      pagoVerificacion: false,
      documentosCompletos: false,
      calificacion: 0,
      cantidadPedidos: 0,
      proveedorConfiable: false,
    });

    user.rol = RolUsuario.PROVEEDOR;
    await this.userRepository.save(user);

    return await this.providerRepository.save(provider);
  }

  async findAll(): Promise<Provider[]> {
    return this.providerRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return provider;
  }

  async update(id: number, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.findOne(id);
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    await this.providerRepository.update(id, updateProviderDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const provider = await this.findOne(id);
    if (!provider) throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);

    const user = await this.userRepository.findOne({ where: { id: provider.usuario.id } });
    if (user && user.rol === RolUsuario.PROVEEDOR) {
      user.rol = RolUsuario.COMERCIANTE;
      await this.userRepository.save(user);
    }

    await this.providerRepository.delete(id);
  }

  async findByUserId(usuario_id: number): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { usuario: { id: usuario_id } },
      relations: ['usuario'],
    });

    if (!provider) {
      throw new NotFoundException(
        `No se encontró un proveedor para el usuario con ID ${usuario_id}`,
      );
    }

    return provider;
  }

  async existsByRut(rut: string): Promise<boolean> {
    const provider = await this.providerRepository.findOne({ where: { rut } });
    return !!provider;
  }

  async updateEstadoVerificacion(id: number, estado: Provider['estadoVerificacion']): Promise<Provider> {
    const provider = await this.findOne(id);
    provider.estadoVerificacion = estado;
    return this.providerRepository.save(provider);
  }

  async marcarPago(id: number): Promise<Provider> {
    const provider = await this.findOne(id);
    provider.pagoVerificacion = true;
    return this.providerRepository.save(provider);
  }

  async marcarDocumentosCompletos(id: number): Promise<Provider> {
    const provider = await this.findOne(id);
    provider.documentosCompletos = true;
    return this.providerRepository.save(provider);
  }
}
