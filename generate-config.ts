import { generateConfig } from './src/utils/config-generator';

async function main() {
  try {
    const configPath = './config/roles.ts';
    await generateConfig(configPath, true);
    console.log(`✅ Configuration file created successfully at ${configPath}`);
    console.log('You can now run "npm run sync:default" to sync permissions');
  } catch (error) {
    console.error('❌ Failed to generate configuration file:', error);
  }
}

main();

