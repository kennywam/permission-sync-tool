import { useMemo } from 'react';
import { defineAbilityFor } from '../casl/defineAbilityFor';
import { AppActions, AppSubjects, AppAbility } from '../casl/ability';

interface Permission {
  action: AppActions;
  subject: AppSubjects;
}

export function usePermission(userPermissions: Permission[]) {
  const ability = useMemo(() => defineAbilityFor(userPermissions), [userPermissions]);

  function can(action: AppActions, subject: AppSubjects) {
    return ability.can(action, subject);
  }

  return { can, ability };
}
