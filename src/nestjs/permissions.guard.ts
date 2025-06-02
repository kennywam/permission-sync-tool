import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { defineAbilityFor } from '../casl/defineAbilityFor'
import { AppActions, AppSubjects } from '../casl/ability'

declare module 'express-serve-static-core' {
  interface Request {
    user?: any
  }
}

export interface RequiredPermission {
  action: AppActions
  subject: AppSubjects
}

export const CHECK_PERMISSIONS_KEY = 'check_permissions'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<RequiredPermission[]>(
      CHECK_PERMISSIONS_KEY,
      context.getHandler()
    )

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user

    if (!user || !('permissions' in user)) {
      throw new ForbiddenException('No permissions found')
    }

    const ability = defineAbilityFor(user.permissions)

    for (const perm of requiredPermissions) {
      if (!ability.can(perm.action, perm.subject)) {
        throw new ForbiddenException(
          `Missing permission: ${perm.action} ${perm.subject}`
        )
      }
    }

    return true
  }
}
