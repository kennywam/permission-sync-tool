import { Ability, AbilityClass } from '@casl/ability'

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'
type Subjects = 'Project' | 'User' | 'all'

export type AppActions = Actions
export type AppSubjects = Subjects

export type AppAbility = Ability<[AppActions, AppSubjects]>
export const AppAbilityClass = Ability as AbilityClass<AppAbility>
