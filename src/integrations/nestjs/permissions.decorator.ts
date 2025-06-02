import { SetMetadata } from '@nestjs/common';
import type { AppActions, AppSubjects } from '../../types';

export interface RequiredPermission {
  action: AppActions;
  subject: AppSubjects;
}

export const CheckPermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata('check_permissions', permissions);