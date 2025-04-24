import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userFirebaseUid = request.user?.uid;

    if (!userFirebaseUid) {
      throw new ForbiddenException('No autorizado');
    }

    const user = await this.usersService.getUserByFirebaseUid(userFirebaseUid);

    if (!requiredRoles.includes(user.rol)) {
      throw new ForbiddenException(`Acceso denegado: se requiere uno de los roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
  