import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export async function generateConfig(configPath: string, withExamples: boolean = true) {
  const dir = dirname(configPath);
  mkdirSync(dir, { recursive: true });

  const template = withExamples ? EXAMPLE_CONFIG : BASIC_CONFIG;
  writeFileSync(configPath, template);
}

const BASIC_CONFIG = `// config/roles.ts
import type { RoleConfig } from 'permission-sync-tool';

export const roles: RoleConfig = {
  // Add your roles here
};
`;

const EXAMPLE_CONFIG = `// config/roles.ts
import type { RoleConfig } from 'permission-sync-tool';

export const roles: RoleConfig = {
  SuperAdmin: [
    { action: 'manage', subject: 'all' },
  ],
  
  Admin: [
    { action: 'create', subject: 'User' },
    { action: 'read', subject: 'User' },
    { action: 'update', subject: 'User' },
    { action: 'delete', subject: 'User' },
    { action: 'manage', subject: 'Post' },
    { action: 'manage', subject: 'Comment' },
  ],
  
  Editor: [
    { action: 'create', subject: 'Post' },
    { action: 'read', subject: 'Post' },
    { action: 'update', subject: 'Post' },
    { action: 'delete', subject: 'Post' },
    { action: 'manage', subject: 'Comment' },
  ],
  
  User: [
    { action: 'read', subject: 'Post' },
    { action: 'create', subject: 'Comment' },
    { 
      action: 'update', 
      subject: 'Comment', 
      conditions: { authorId: '\${user.id}' } 
    },
    { 
      action: 'delete', 
      subject: 'Comment', 
      conditions: { authorId: '\${user.id}' } 
    },
  ],
  
  Guest: [
    { action: 'read', subject: 'Post' },
  ],
};

export type RoleName = keyof typeof roles;
`;