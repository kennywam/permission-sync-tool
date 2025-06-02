import { PrismaClient } from '@prisma/client';
import { roles } from '../roles.config';

const prisma = new PrismaClient();

export async function syncPermissions() {
  for (const role of roles) {
    const existing = await prisma.role.findUnique({ where: { name: role.name } });

    if (existing) {
      await prisma.permission.deleteMany({ where: { roleId: existing.id } });
      await prisma.role.update({
        where: { name: role.name },
        data: {
          permissions: { create: role.permissions },
        },
      });
      console.log(`🔁 Updated role: ${role.name}`);
    } else {
      await prisma.role.create({
        data: {
          name: role.name,
          permissions: { create: role.permissions },
        },
      });
      console.log(`✅ Created role: ${role.name}`);
    }
  }
}
