import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync } from 'fs';
import { loadConfig } from '../utils/config-loader';
import { validateConfig } from '../utils/config-validator';
import { generateConfig } from '../utils/config-generator';
import type { SyncConfig, RoleConfig } from '../types';

export async function syncPermissions(config: SyncConfig = {}) {
  const {
    configPath = './config/roles.ts',
    dryRun = false,
    verbose = false,
    force = false,
    roles: specificRoles,
    databaseUrl,
  } = config;

  const spinner = ora('Loading configuration...').start();

  try {
    // Check if configuration file exists, if not generate it
    if (!existsSync(configPath)) {
      spinner.info(`Configuration file not found: ${configPath}`);
      spinner.start('Generating default configuration file...');
      await generateConfig(configPath, true);
      spinner.succeed(`Default configuration file created at ${configPath}`);
      spinner.start('Loading configuration...');
    }
    
    // Load and validate configuration
    const rolesConfig = await loadConfig(configPath);
    await validateConfig(configPath);
    
    spinner.succeed('Configuration loaded successfully');

    // Initialize Prisma client
    const prisma = new PrismaClient({
      datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
      log: verbose ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    const syncSpinner = ora('Syncing permissions...').start();

    const stats = {
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
    };

    // Filter roles if specific roles are requested
    const rolesToSync = specificRoles
      ? Object.entries(rolesConfig).filter(([name]) => specificRoles.includes(name))
      : Object.entries(rolesConfig);

    if (dryRun) {
      syncSpinner.info('🔍 DRY RUN - No changes will be made');
    }

    for (const [roleName, permissions] of rolesToSync) {
      try {
        const existing = await prisma.role.findUnique({
          where: { name: roleName },
          include: { permissions: true },
        });

        if (dryRun) {
          if (existing) {
            console.log(chalk.yellow(`Would update role: ${roleName}`));
          } else {
            console.log(chalk.green(`Would create role: ${roleName}`));
          }
          continue;
        }

        if (existing) {
          if (force) {
            // Delete existing permissions and recreate
            await prisma.permission.deleteMany({
              where: { roles: { some: { id: existing.id } } },
            });

            // Process each permission, checking if it already exists
            const permissionPromises = permissions.map(async (perm) => {
              // Use upsert to handle the case where the permission already exists
              return prisma.permission.upsert({
                where: {
                  action_subject: {
                    action: perm.action,
                    subject: perm.subject
                  }
                },
                update: {
                  // Update conditions if they've changed
                  conditions: perm.conditions ? JSON.stringify(perm.conditions) : null,
                },
                create: {
                  action: perm.action,
                  subject: perm.subject,
                  conditions: perm.conditions ? JSON.stringify(perm.conditions) : null,
                },
              });
            });

            const createdPerms = await Promise.all(permissionPromises);

            // Connect the permissions to the role
            await prisma.role.update({
              where: { id: existing.id },
              data: {
                permissions: {
                  connect: createdPerms.map(perm => ({ id: perm.id })),
                },
              },
            });

            stats.updated++;
            if (verbose) {
              console.log(chalk.blue(`🔄 Updated role: ${roleName}`));
            }
          } else {
            stats.skipped++;
            if (verbose) {
              console.log(chalk.gray(`⏭️  Skipped existing role: ${roleName}`));
            }
          }
        } else {
          // Create new role with permissions
          // Process each permission, checking if it already exists
          const permissionPromises = permissions.map(async (perm) => {
            // Use upsert to handle the case where the permission already exists
            return prisma.permission.upsert({
              where: {
                action_subject: {
                  action: perm.action,
                  subject: perm.subject
                }
              },
              update: {
                // Update conditions if they've changed
                conditions: perm.conditions ? JSON.stringify(perm.conditions) : null,
              },
              create: {
                action: perm.action,
                subject: perm.subject,
                conditions: perm.conditions ? JSON.stringify(perm.conditions) : null,
              },
            });
          });

          const createdPerms = await Promise.all(permissionPromises);

          // Create the role and connect it to the permissions
          await prisma.role.create({
            data: {
              name: roleName,
              permissions: {
                connect: createdPerms.map(perm => ({ id: perm.id })),
              },
            },
          });

          stats.created++;
          if (verbose) {
            console.log(chalk.green(`✅ Created role: ${roleName}`));
          }
        }
      } catch (error) {
        console.error(chalk.red(`❌ Error processing role ${roleName}:`), (error as Error).message);
      }
    }

    syncSpinner.succeed('Permissions synced successfully');

    // Display summary
    console.log('\n📊 Sync Summary:');
    console.log(`   Created: ${chalk.green(stats.created)}`);
    console.log(`   Updated: ${chalk.blue(stats.updated)}`);
    console.log(`   Skipped: ${chalk.gray(stats.skipped)}`);

    await prisma.$disconnect();

  } catch (error) {
    spinner.fail('Sync failed');
    throw error;
  }
}
