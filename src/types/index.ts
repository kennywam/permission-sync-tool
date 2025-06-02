import type { Ability } from '@casl/ability';

export type AppActions = 
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete';

export type AppSubjects = 
  | 'all'
  | 'User'
  | 'Post'
  | 'Comment'
  | string;

export interface PermissionCondition {
  [key: string]: any;
}

export interface Permission {
  action: AppActions;
  subject: AppSubjects;
  conditions?: PermissionCondition;
}

export interface RoleConfig {
  [roleName: string]: Permission[];
}

export interface SyncConfig {
  configPath?: string;
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
  roles?: string[];
  databaseUrl?: string;
}

export type AppAbility = Ability<[AppActions, AppSubjects]>;
