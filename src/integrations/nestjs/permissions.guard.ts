import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { defineAbilityFor } from '../../casl/defineAbility';
import { Permission, AppActions, AppSubjects } from '../../types';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    permissions: Permission[];
    roles: Array<{ name: string }>;
  };
}

export interface RequiredPermission {
  action: AppActions;
  subject: AppSubjects;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<RequiredPermission[]>(
      'check_permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!user.permissions || user.permissions.length === 0) {
      throw new ForbiddenException('No permissions assigned');
    }

    const ability = defineAbilityFor(user.permissions);

    for (const permission of requiredPermissions) {
      if (!ability.can(permission.action, permission.subject)) {
        throw new ForbiddenException(
          `Missing permission: ${permission.action} on ${permission.subject}`
        );
      }
    }

    return true;
  }
}
