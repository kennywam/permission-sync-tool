const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

console.log('🔧 Setting up the project...');

run('npx prisma migrate dev --name init');
run('npx prisma generate');
run('npx prisma db seed');

console.log('\n✅ Setup complete!');
