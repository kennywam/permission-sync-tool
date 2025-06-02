# Permission Sync Tool

A simple CLI + library for syncing roles and permissions to your Prisma database and generating CASL abilities for NestJS and React apps.

## 🚀 Installation
```bash
npm install -D permission-sync-tool
```

## 🛠 Setup
Run this to apply migrations and seed roles/permissions:
```bash
node scripts/install.js
```

## 🔧 Usage
```bash
npx permission-sync
```

## 📁 Roles Config
Create `roles.config.ts`:
```ts
export const roles = [
  {
    name: 'Admin',
    permissions: [
      { action: 'manage', subject: 'all' },
    ],
  },
  {
    name: 'User',
    permissions: [
      { action: 'read', subject: 'Project' },
    ],
  },
]
```

## 📦 Prisma Schema
```prisma
model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  permissions Permission[]
}

model Permission {
  id        String   @id @default(cuid())
  action    String
  subject   String
  role      Role     @relation(fields: [roleId], references: [id])
  roleId    String
}
```

## 🛡️ NestJS Guard
```ts
@UseGuards(PermissionsGuard)
@Permissions({ action: 'read', subject: 'Project' })
@Get('projects')
findAll() { return this.projectService.findAll() }
```

## ⚛️ React Hook
```ts
const { can } = usePermission(currentUser)
if (can('delete', 'Project')) {
  return <DeleteButton />
}
```

## 🧪 Local Database (Optional)
If you don’t already have PostgreSQL and Redis locally, you can use:

### DBngin Setup *(Optional)*
1. **Install DBngin**: Download [DBngin](https://dbngin.com/) on your machine.
2. **Create Instances**:
   - PostgreSQL
   - Redis

Or use any of the following:
- Docker (`docker-compose`)
- Supabase, Neon, Railway, Render, etc.

Just update your `.env` file with the correct DB URLs.