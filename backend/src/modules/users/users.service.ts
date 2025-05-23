import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, RolUsuario } from './entity/user.entity';
import { CreateUserDto, UpdateUserDto, CompleteProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
            ...createUserDto,
            rol: createUserDto.rol ?? RolUsuario.COMERCIANTE,
        });

        return await this.userRepository.save(user);
    }

    async createIfNotExists(firebaseUid: string, createUserDto: CreateUserDto): Promise<User> {
        const existing = await this.userRepository.findOne({ where: { firebaseUid } });
        if (existing) return existing;

        return await this.createUser(createUserDto);
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['proveedorInfo'],
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { firebaseUid },
            relations: ['proveedorInfo'],
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['proveedorInfo'],
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        if (updateUserDto.rol) {
            const allowedRoles = ['admin', 'verificador', 'moderador', 'soporte', 'proveedor', 'comerciante'];
            if (!allowedRoles.includes(updateUserDto.rol)) {
                throw new BadRequestException('Rol inválido');
            }
        }

        await this.userRepository.update(id, updateUserDto);
        return await this.getUserById(id);
    }

    async deleteUser(id: number): Promise<void> {
        const user = await this.getUserById(id);
        await this.userRepository.remove(user);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({ relations: ['proveedorInfo'] });
    }

    async completeProfile(user: User, dto: CompleteProfileDto) {
        user.nombre = dto.nombre;
        user.telefono = dto.telefono;
        user.departamento = dto.departamento;
        user.ciudad = dto.ciudad;

        await this.userRepository.save(user);

        return { message: 'Perfil actualizado correctamente' };
    }

}
