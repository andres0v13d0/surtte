import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, RolUsuario } from '../users/entity/user.entity';
import { admin } from '../../firebase/firebase-admin';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async login(firebaseToken: string): Promise<User> {
    try {
      const decoded = await admin.auth().verifyIdToken(firebaseToken);
      const { uid, email, name } = decoded;

      const user = await this.usersService.createIfNotExists(uid, {
        firebaseUid: uid,
        email: email ?? '',
        nombre: name ?? 'Usuario sin nombre',
        rol: RolUsuario.COMERCIANTE,
      });

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
