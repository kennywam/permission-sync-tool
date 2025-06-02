#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { syncPermissions } from './core/sync';
import { generateConfig } from './utils/config-generator';
import { validateConfig } from './utils/config-validator';

const program = new Command();

program
  .name('permission-sync-tool')
  .description('A CLI tool for syncing roles and permissions with Prisma and CASL')
  .version('2.0.0');

program
  .command('sync')
  .description('Sync roles and permissions to database')
  .option('-c, --config <path>', 'Config file path', './config/roles.ts')
  .option('-d, --dry-run', 'Show what would be synced without making changes')
  .option('-v, --verbose', 'Verbose output')
  .option('-f, --force', 'Force sync (recreate all permissions)')
  .option('-r, --roles <roles>', 'Sync specific roles only (comma-separated)')
  .action(async (options) => {
    try {
      const config = {
        configPath: options.config,
        dryRun: options.dryRun,
        verbose: options.verbose,
        force: options.force,
        roles: options.roles ? options.roles.split(',') : undefined,
      };

      await syncPermissions(config);
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize configuration files')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'configPath',
        message: 'Where should we create the config file?',
        default: './config/roles.ts',
      },
      {
        type: 'confirm',
        name: 'createExample',
        message: 'Create example roles configuration?',
        default: true,
      },
    ]);

    await generateConfig(answers.configPath, answers.createExample);
    console.log(chalk.green('✅ Configuration initialized!'));
  });

program
  .command('validate')
  .description('Validate configuration file')
  .option('-c, --config <path>', 'Config file path', './config/roles.ts')
  .action(async (options) => {
    try {
      await validateConfig(options.config);
      console.log(chalk.green('✅ Configuration is valid!'));
    } catch (error) {
      console.error(chalk.red('❌ Configuration validation failed:'), (error as Error).message);
      process.exit(1);
    }
  });

program.parse();