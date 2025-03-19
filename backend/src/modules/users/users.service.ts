import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { firebaseUid } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        await this.userRepository.update(id, updateUserDto);
        const updatedUser = await this.getUserById(id);
        return updatedUser;
    }

    async deleteUser(id: number): Promise<void> {
        const user = await this.getUserById(id);
        await this.userRepository.remove(user);
    }
}
