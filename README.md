# 🔐 Permission Sync Tool

[![npm version](https://img.shields.io/npm/v/permission-sync-tool.svg)](https://www.npmjs.com/package/permission-sync-tool)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A powerful CLI tool and utility library for seamlessly syncing roles and permissions to your Prisma database while generating type-safe CASL abilities for **NestJS**, **React**, and **TypeScript** applications.

> 🚀 **Perfect for teams** using Prisma, CASL, and TypeScript who need robust, type-safe permission management.

## 🌟 Features

- **🔄 Automatic Sync**: Keep your database permissions in sync with your codebase
- **⚡ Type-Safe**: Full TypeScript support with generated types
- **🛡️ CASL Integration**: Seamless integration with CASL for authorization
- **🏗️ Framework Agnostic**: Works with NestJS, React, Express, and more
- **📝 CLI & Library**: Use as a CLI tool or import as a library
- **🔧 Configurable**: Flexible configuration options
- **🚀 Production Ready**: Built for enterprise applications

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [CLI Usage](#-cli-usage)
- [NestJS Integration](#-nestjs-integration)
- [React Integration](#-react-integration)
- [API Reference](#-api-reference)
- [Advanced Usage](#-advanced-usage)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🚀 Quick Start

Get up and running in under 5 minutes:

```bash
# 1. Install the package
npm install permission-sync-tool

# 2. Set up your Prisma schema (see Configuration section)

# 3. Create your roles configuration
echo "export const roles = {
  Admin: [{ action: 'manage', subject: 'all' }],
  User: [{ action: 'read', subject: 'Post' }]
}" > config/roles.ts

# 4. Sync permissions to database
npx permission-sync-tool sync --config=./config/roles.ts
```

---

## 📦 Installation

### Option 1: Package Installation (Recommended)

```bash
npm install permission-sync-tool
# or
yarn add permission-sync-tool
# or
pnpm add permission-sync-tool
```

### Option 2: Global Installation

```bash
npm install -g permission-sync-tool
```

### Option 3: Development Installation

```bash
git clone https://github.com/kennywam/permission-sync-tool.git
cd permission-sync-tool
npm install
npm run build
```

---

## ⚙️ Configuration

### 1. Prisma Schema Setup

Add these models to your `schema.prisma`:

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String?
  roles    Role[] @relation("UserRole")
  // ... your other fields
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  permissions Permission[] @relation("RolePermission")
  users       User[]       @relation("UserRole")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Permission {
  id      String @id @default(cuid())
  action  String
  subject String
  roles   Role[] @relation("RolePermission")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([action, subject])
}
```

### 2. Database Migration

```bash
npx prisma db push
# or
npx prisma migrate dev --name add-permissions
```

### 3. Roles Configuration

Create a configuration file (e.g., `config/roles.ts`):

```typescript
// config/roles.ts

export const roles = {
  // Super Admin - can do everything
  SuperAdmin: [
    { action: 'manage', subject: 'all' },
  ],
  
  // Admin - can manage most resources
  Admin: [
    { action: 'create', subject: 'User' },
    { action: 'read', subject: 'User' },
    { action: 'update', subject: 'User' },
    { action: 'delete', subject: 'User' },
    { action: 'manage', subject: 'Post' },
    { action: 'manage', subject: 'Comment' },
  ],
  
  // Editor - can manage content
  Editor: [
    { action: 'create', subject: 'Post' },
    { action: 'read', subject: 'Post' },
    { action: 'update', subject: 'Post' },
    { action: 'delete', subject: 'Post' },
    { action: 'manage', subject: 'Comment' },
  ],
  
  // User - basic permissions
  User: [
    { action: 'read', subject: 'Post' },
    { action: 'create', subject: 'Comment' },
    { action: 'update', subject: 'Comment', conditions: { authorId: '${user.id}' } },
    { action: 'delete', subject: 'Comment', conditions: { authorId: '${user.id}' } },
  ],
  
  // Guest - read-only access
  Guest: [
    { action: 'read', subject: 'Post' },
  ],
} as const;

export type RoleName = keyof typeof roles;
```

### 4. Environment Variables

```bash
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
```

---

## 🖥️ CLI Usage

### Basic Sync Command

```bash
# Sync with default config (./config/roles.ts)
npx permission-sync-tool sync

# Sync with custom config path
npx permission-sync-tool sync --config=./path/to/roles.ts

# Sync with environment-specific config
npx permission-sync-tool sync --config=./config/roles.prod.ts
```

### Advanced CLI Options

```bash
# Dry run - see what would be synced without making changes
npx permission-sync-tool sync --dry-run

# Verbose output
npx permission-sync-tool sync --verbose

# Force sync (recreate all permissions)
npx permission-sync-tool sync --force

# Sync specific roles only
npx permission-sync-tool sync --roles=Admin,User

# Help
npx permission-sync-tool --help
```

### Integration with Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "sync-permissions": "permission-sync-tool sync",
    "sync-permissions:prod": "permission-sync-tool sync --config=./config/roles.prod.ts",
    "build": "npm run sync-permissions && next build"
  }
}
```

---

## 🛡️ NestJS Integration

### 1. Permissions Guard

```typescript
// guards/permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { defineAbilityFor } from 'permission-sync-tool';
import { AppActions, AppSubjects } from '../types/permissions';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    permissions: Array<{ action: string; subject: string; conditions?: any }>;
    roles: Array<{ name: string }>;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<
      Array<{ action: AppActions; subject: AppSubjects }>
    >('check_permissions', context.getHandler());

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!user.permissions || user.permissions.length === 0) {
      throw new ForbiddenException('No permissions assigned');
    }

    const ability = defineAbilityFor(user.permissions);

    for (const permission of requiredPermissions) {
      if (!ability.can(permission.action, permission.subject)) {
        throw new ForbiddenException(
          `Missing permission: ${permission.action} on ${permission.subject}`
        );
      }
    }

    return true;
  }
}
```

### 2. Permissions Decorator

```typescript
// decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { AppActions, AppSubjects } from '../types/permissions';

export interface RequiredPermission {
  action: AppActions;
  subject: AppSubjects;
}

export const CheckPermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata('check_permissions', permissions);
```

### 3. Controller Usage

```typescript
// controllers/posts.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CheckPermissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { AuthGuard } from '../guards/auth.guard';

@Controller('posts')
@UseGuards(AuthGuard, PermissionsGuard)
export class PostsController {
  @Get()
  @CheckPermissions({ action: 'read', subject: 'Post' })
  findAll() {
    return this.postsService.findAll();
  }

  @Post()
  @CheckPermissions({ action: 'create', subject: 'Post' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }
}
```

### 4. Service Integration

```typescript
// services/permissions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { defineAbilityFor } from 'permission-sync-tool';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const permissions = user?.roles.flatMap(role => 
      role.permissions.map(p => ({
        action: p.action,
        subject: p.subject,
      }))
    ) || [];

    return defineAbilityFor(permissions);
  }
}
```

---

## ⚛️ React Integration

### 1. Permission Hook

```typescript
// hooks/usePermissions.ts
import { useMemo, useContext } from 'react';
import { defineAbilityFor } from 'permission-sync-tool';
import { AuthContext } from '../contexts/AuthContext';
import { AppActions, AppSubjects } from '../types/permissions';

export interface Permission {
  action: AppActions;
  subject: AppSubjects;
  conditions?: any;
}

export function usePermissions() {
  const { user } = useContext(AuthContext);
  
  const ability = useMemo(() => {
    if (!user?.permissions) return null;
    return defineAbilityFor(user.permissions);
  }, [user?.permissions]);

  const can = (action: AppActions, subject: AppSubjects, resource?: any) => {
    return ability?.can(action, subject, resource) ?? false;
  };

  const cannot = (action: AppActions, subject: AppSubjects, resource?: any) => {
    return !can(action, subject, resource);
  };

  return { can, cannot, ability };
}
```

### 2. Permission Component

```typescript
// components/PermissionGate.tsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { AppActions, AppSubjects } from '../types/permissions';

interface PermissionGateProps {
  action: AppActions;
  subject: AppSubjects;
  resource?: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  action,
  subject,
  resource,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissions();

  if (can(action, subject, resource)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
```

### 3. Usage Examples

```typescript
// components/PostList.tsx
import React from 'react';
import { PermissionGate } from './PermissionGate';
import { usePermissions } from '../hooks/usePermissions';

export function PostList({ posts }) {
  const { can } = usePermissions();

  return (
    <div>
      <PermissionGate action="create" subject="Post">
        <button>Create New Post</button>
      </PermissionGate>

      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          
          <PermissionGate 
            action="update" 
            subject="Post" 
            resource={post}
          >
            <button>Edit</button>
          </PermissionGate>
          
          {can('delete', 'Post', post) && (
            <button onClick={() => deletePost(post.id)}>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 API Reference

### Core Functions

#### `defineAbilityFor(permissions)`

Creates a CASL ability instance from an array of permissions.

```typescript
import { defineAbilityFor } from 'permission-sync-tool';

const permissions = [
  { action: 'read', subject: 'Post' },
  { action: 'create', subject: 'Comment' }
];

const ability = defineAbilityFor(permissions);
console.log(ability.can('read', 'Post')); // true
```

#### `syncPermissions(config)`

Syncs roles and permissions to the database.

```typescript
import { syncPermissions } from 'permission-sync-tool';

await syncPermissions({
  configPath: './config/roles.ts',
  dryRun: false,
  verbose: true
});
```

### Types

```typescript
// Available action types
export type AppActions = 
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete';

// Available subject types (extend as needed)
export type AppSubjects = 
  | 'all'
  | 'User'
  | 'Post'
  | 'Comment'
  | string;

// Permission interface
export interface Permission {
  action: AppActions;
  subject: AppSubjects;
  conditions?: any;
}
```

---

## 🔧 Advanced Usage

### Conditional Permissions

```typescript
// config/roles.ts
export const roles = {
  User: [
    { action: 'read', subject: 'Post' },
    { 
      action: 'update', 
      subject: 'Post', 
      conditions: { authorId: '${user.id}' } 
    },
    { 
      action: 'delete', 
      subject: 'Comment', 
      conditions: { authorId: '${user.id}' } 
    },
  ],
};
```

### Custom Subjects

```typescript
// types/permissions.ts
export type AppSubjects = 
  | 'all'
  | 'User'
  | 'Post'
  | 'Comment'
  | 'Analytics'
  | 'Settings'
  | 'Billing';
```

### Multi-tenant Permissions

```typescript
// config/tenant-roles.ts
export const createTenantRoles = (tenantId: string) => ({
  TenantAdmin: [
    { 
      action: 'manage', 
      subject: 'all',
      conditions: { tenantId }
    },
  ],
  TenantUser: [
    { 
      action: 'read', 
      subject: 'Post',
      conditions: { tenantId }
    },
  ],
});
```

### Environment-specific Configurations

```typescript
// config/roles.prod.ts
export const roles = {
  Admin: [
    { action: 'read', subject: 'User' },
    { action: 'update', subject: 'User' },
    // No delete in production
  ],
};

// config/roles.dev.ts
export const roles = {
  Admin: [
    { action: 'manage', subject: 'all' }, // Full access in development
  ],
};
```

---

## 🔍 Troubleshooting

### Common Issues

#### ❌ "Cannot find module" Error

```bash
# Ensure the package is installed
npm list permission-sync-tool

# Reinstall if necessary
npm uninstall permission-sync-tool
npm install permission-sync-tool
```

#### ❌ Database Connection Error

```bash
# Check your DATABASE_URL
echo $DATABASE_URL

# Test Prisma connection
npx prisma db pull
```

#### ❌ TypeScript Compilation Errors

```typescript
// Ensure you have proper types
import type { AppActions, AppSubjects } from 'permission-sync-tool';
```

#### ❌ Permissions Not Syncing

```bash
# Run with verbose output
npx permission-sync-tool sync --verbose

# Check your config file path
npx permission-sync-tool sync --config=./config/roles.ts --dry-run
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=permission-sync-tool npx permission-sync-tool sync
```

### Getting Help

1. Check the [GitHub Issues](https://github.com/kennywam/permission-sync-tool/issues)
2. Review the [documentation](https://github.com/kennywam/permission-sync-tool#readme)
---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/kennywam/permission-sync-tool.git
cd permission-sync-tool
npm install
npm run dev
```

### Conventional Commits

This project follows the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). All commit messages must adhere to this format to ensure clear communication and automated versioning.

```
<type>(<scope>): <description>
```

#### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **chore**: Other changes that don't modify src or test files

#### Creating Commits

To make it easier to follow this convention, you can use our commit script:

```bash
npm run commit
```

This will guide you through creating a properly formatted commit message.

### Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Code Style

We use Prettier and ESLint:

```bash
npm run lint
npm run format
```

---

## 📋 Roadmap

- [ ] **v2.0.0**: GraphQL integration
- [ ] **v2.1.0**: Multi-database support
- [ ] **v2.2.0**: Permission caching layer
- [ ] **v2.3.0**: Audit logging
- [ ] **v2.4.0**: Web dashboard
- [ ] **v3.0.0**: Plugin system

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

## 🙏 Acknowledgments

- [CASL](https://casl.js.org/) - Amazing authorization library
- [Prisma](https://prisma.io/) - Next-generation ORM
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://reactjs.org/) - UI library

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/kennywam/permission-sync-tool?style=social)
![GitHub forks](https://img.shields.io/github/forks/kennywam/permission-sync-tool?style=social)
![npm downloads](https://img.shields.io/npm/dm/permission-sync-tool)

---

**Built with ❤️ by [Kenny](https://github.com/kennywam) and [contributors](https://github.com/kennywam/permission-sync-tool/graphs/contributors)**
