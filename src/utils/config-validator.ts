import type { RoleConfig } from '../types';
import { loadConfig } from './config-loader';

const VALID_ACTIONS = ['manage', 'create', 'read', 'update', 'delete'];

export async function validateConfig(configPath: string): Promise<void> {
  const config = await loadConfig(configPath);

  for (const [roleName, permissions] of Object.entries(config)) {
    if (!Array.isArray(permissions)) {
      throw new Error(`Permissions for role "${roleName}" must be an array`);
    }

    for (const [index, permission] of permissions.entries()) {
      if (!permission.action || !permission.subject) {
        throw new Error(
          `Permission ${index} for role "${roleName}" must have "action" and "subject" properties`
        );
      }

      if (!VALID_ACTIONS.includes(permission.action)) {
        throw new Error(
          `Invalid action "${permission.action}" for role "${roleName}". Valid actions: ${VALID_ACTIONS.join(', ')}`
        );
      }

      if (typeof permission.subject !== 'string') {
        throw new Error(
          `Subject must be a string for permission ${index} in role "${roleName}"`
        );
      }

      if (permission.conditions && typeof permission.conditions !== 'object') {
        throw new Error(
          `Conditions must be an object for permission ${index} in role "${roleName}"`
        );
      }
    }
  }
}