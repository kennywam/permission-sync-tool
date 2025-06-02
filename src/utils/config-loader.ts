import { existsSync } from 'fs';
import { resolve } from 'path';
import type { RoleConfig } from '../types';

export async function loadConfig(configPath: string): Promise<RoleConfig> {
  const fullPath = resolve(configPath);
  
  if (!existsSync(fullPath)) {
    throw new Error(`Configuration file not found: ${fullPath}`);
  }

  try {
    // Dynamic import to support both .ts and .js files
    const module = await import(fullPath);
    const roles = module.roles || module.default?.roles || module.default;
    
    if (!roles || typeof roles !== 'object') {
      throw new Error('Configuration must export a "roles" object');
    }

    return roles;
  } catch (error) {
    throw new Error(`Failed to load configuration: ${(error as Error).message}`);
  }
}