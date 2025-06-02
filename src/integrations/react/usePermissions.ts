import { useMemo } from 'react';
import { defineAbilityFor } from '../../casl/defineAbility';
import type { AppActions, AppSubjects, Permission } from '../../types';

export interface UsePermissionsProps {
  permissions: Permission[];
}

export function usePermissions(permissions: Permission[] = []) {
  const ability = useMemo(() => {
    if (!permissions || permissions.length === 0) return null;
    return defineAbilityFor(permissions);
  }, [permissions]);

  const can = (action: AppActions, subject: AppSubjects, resource?: any) => {
    return ability?.can(action, subject, resource) ?? false;
  };

  const cannot = (action: AppActions, subject: AppSubjects, resource?: any) => {
    return !can(action, subject, resource);
  };

  return { can, cannot, ability };
}
