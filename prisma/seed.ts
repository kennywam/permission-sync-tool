import { PrismaClient } from '@prisma/client';
import { roles } from '../roles.config';

const prisma = new PrismaClient();

async function main() {
  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        permissions: {
          create: role.permissions,
        },
      },
    });

    console.log(`Seeded role: ${dbRole.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
