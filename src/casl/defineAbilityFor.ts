import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import type { AppAbility, AppActions, AppSubjects } from './ability'

interface Permission {
  action: AppActions
  subject: AppSubjects
}

export function defineAbilityFor(permissions: Permission[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  for (const perm of permissions) {
    can(perm.action, perm.subject)
  }

  return build()
}
