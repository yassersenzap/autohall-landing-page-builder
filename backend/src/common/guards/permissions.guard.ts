import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { type Permission, roleHasPermission } from '../../auth/permissions.config';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<Permission | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user || !roleHasPermission(user.role, requiredPermission)) {
      throw new ForbiddenException({
        success: false,
        message: 'Permissions insuffisantes pour cette action',
        code: 'AUTH_FORBIDDEN',
        required: requiredPermission,
      });
    }

    return true;
  }
}
