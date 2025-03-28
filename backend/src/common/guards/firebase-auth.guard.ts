import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { admin } from '../../firebase/firebase-admin';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;

      const userDB = await this.usersService.getUserByFirebaseUid(decodedToken.uid);
      if (!userDB) {
        throw new UnauthorizedException('Usuario no registrado en la base de datos');
      }

      req.userDB = userDB;
      return true;
    } catch (err) {
      console.error('Error en FirebaseAuthGuard:', err);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
