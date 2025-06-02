import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { AppAbility, Permission } from '../types';

export function defineAbilityFor(permissions: Permission[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  for (const permission of permissions) {
    if (permission.conditions) {
      can(permission.action, permission.subject, permission.conditions);
    } else {
      can(permission.action, permission.subject);
    }
  }

  return build();
}
