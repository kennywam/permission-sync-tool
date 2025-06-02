import React from 'react';
import type { AppActions, AppSubjects, Permission } from '../../types';
import { usePermissions } from './usePermissions';

interface PermissionGateProps {
  action: AppActions;
  subject: AppSubjects;
  resource?: any;
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  action,
  subject,
  resource,
  permissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissions(permissions);

  if (can(action, subject, resource)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
