import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(firebaseToken: string): Promise<User> {
    try {
      const decoded = await admin.auth().verifyIdToken(firebaseToken);
      const { uid, email, name } = decoded;

      let user = await this.userRepository.findOne({ where: { firebaseUid: uid } });

      if (!user) {
        user = this.userRepository.create({
          firebaseUid: uid,
          email: email || '',
          nombre: name || 'Usuario sin nombre',
          proveedor: false,
        });
        await this.userRepository.save(user);
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
