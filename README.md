# Store System Monorepo

Store management system with multiple applications and shared packages.

## Project Structure

### Applications (apps/)

- **admin-panel** - Administration panel for system management (Vue 3 + Vite)
- **store-front** - Web application for end customers (Vue 3 + Vite)
- **warehouse-app** - Warehouse management application (Vue 3 + Vite)
- **landing-page** - Public marketing site (Astro)
- **api** - Backend REST API (Node.js + TypeScript)

### Shared Packages (packages/)

- **@store-system/types** - Shared TypeScript types across projects
- **@store-system/db** - Prisma ORM v7 database client with SQLite and modular schemas
- **@store-system/ui-components** - Reusable Vue component library
- **@store-system/ui-theme** - Shared design tokens and styles (SCSS)
- **@store-system/tsconfig** - Base TypeScript configurations for the monorepo

## Documentation

- [Database Setup](./docs/database.md) - Database configuration, schema setup, and Prisma ORM v7 usage
- [Database Models](./docs/models.md) - Data model definitions and relationships

## Quick Start

### Prerequisites

- Node.js v18 or newer
- pnpm v8 or newer

### Installation

```bash
# Install all monorepo dependencies
pnpm install

# Build all shared packages
pnpm build

# Setup database (first time only)
cd packages/db
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init_auth_and_hr
```

### Available Commands

```bash
# Development - Start all services in watch mode
pnpm dev

# Build - Build all packages and applications
pnpm build

# Type Check - Verify TypeScript types across the monorepo
pnpm type-check

# Clean - Remove all build artifacts
pnpm clean
```

### Development Scripts for Individual Apps

```bash
# Run individual applications (use -w flag to run from root)
pnpm -w run dev:admin       # Admin Panel
pnpm -w run dev:api         # API Server
pnpm -w run dev:store       # Store Front (POS)
pnpm -w run dev:warehouse   # Warehouse App
pnpm -w run dev:landing     # Landing Page

# Database quick commands
pnpm -w run db:generate     # Generate Prisma Client
pnpm -w run db:migrate      # Create and apply migration
pnpm -w run db:studio       # Open Prisma Studio
```

### Working with Specific Packages

```bash
# Run a command in a specific package
pnpm --filter @store-system/types build
pnpm --filter @store-system/ui-components dev

# Run in a specific application
pnpm --filter @store-system/admin-panel dev

# Database commands
pnpm --filter @store-system/db exec prisma generate
pnpm --filter @store-system/db exec prisma studio
```

## Database

The project uses Prisma ORM v7 with SQLite in a shared database architecture. All applications access the same `dev.db` file located at the monorepo root.

### Quick Database Commands

```bash
# Generate Prisma Client
cd packages/db
pnpm exec prisma generate

# Create/apply migrations
pnpm exec prisma migrate dev --name <migration_name>

# Open database GUI
pnpm exec prisma studio

# Reset database (deletes all data)
pnpm exec prisma migrate reset
```

See [docs/database.md](./docs/database.md) for detailed setup instructions and Prisma 7 configuration details.

## TypeScript Configuration

The monorepo uses shared TypeScript configurations located in `packages/tsconfig/`:

- **base.json** - Base configuration with strict rules for all projects
- **vue.json** - Configuration specific to Vue apps with Vite
- **node.json** - Configuration for Node.js/backend projects
- **astro.json** - Configuration for Astro projects
- **library.json** - Configuration for libraries/shared packages

Each project extends these configurations using relative paths:

```json
{
  "extends": "../../packages/tsconfig/vue.json",
  "compilerOptions": {
    // Project-specific configurations
  }
}
```

## Package Development

### Adding Workspace Dependencies

```bash
# Add a workspace package to another
pnpm --filter @store-system/api add @store-system/types@workspace:*
pnpm --filter @store-system/admin-panel add @store-system/ui-components@workspace:*
```

### Adding External Dependencies

```bash
# Add a dependency to a specific package
pnpm --filter @store-system/api add express
pnpm --filter @store-system/types add -D typescript
```

### Shared Package Layout

```
packages/types/
├── src/
│   ├── index.ts        # Main entry point
│   ├── user.ts         # User-related types
│   └── product.ts      # Product-related types
├── dist/               # Compiled files (generated)
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

## Monorepo Architecture

### Dependency Management

- **pnpm workspaces** - Efficient management of shared dependencies
- **workspace:** - References between monorepo packages

### Build and Cache

- **Turborepo** - Incremental build system with smart caching
- Build pipelines configured in `turbo.json`
- Local cache to speed up rebuilds

### Shared Types

The `@store-system/types` package provides common types:

```typescript
import type { User, Product } from '@store-system/types';
```

### Database Access

The `@store-system/db` package provides type-safe database access:

```typescript
import { prisma } from '@store-system/db';

// Type-safe queries with autocomplete
const users = await prisma.user.findMany({
  include: { employee: true }
});
```

All Prisma models are automatically typed and available across the monorepo.

### Shared Components

The `@store-system/ui-components` package exports Vue components:

```typescript
import { Button } from '@store-system/ui-components';
```

## Next Steps

### Base Infrastructure

- [x] Configure ORM (Prisma v7) in `@store-system/db`
- [x] Modular schema architecture (auth, hr, sales, inventory)
- [ ] Implement API with a framework (Express/Fastify/Hono)
- [ ] Configure environment variables (.env and validation)
- [ ] Configure Docker for local development

### Code Quality

- [ ] Configure ESLint with shared rules
- [ ] Configure Prettier for consistent formatting
- [ ] Configure Husky for git hooks
- [ ] Implement pre-commit linting

### Testing

- [ ] Configure Vitest for unit tests
- [ ] Configure Playwright for E2E tests
- [ ] Add tests for critical packages
- [ ] Configure coverage reports

### CI/CD

- [ ] Configure GitHub Actions / GitLab CI
- [ ] Automatic testing pipeline
- [ ] Automatic build and deploy
- [ ] Semantic versioning and changelogs

## Tech Stack

### Core

- **Package Manager:** pnpm 10.19.0
- **Build System:** Turborepo 2.7.6
- **Runtime:** Node.js v25+
- **Language:** TypeScript 5.7.3

### Frontend

- **Framework:** Vue 3.5.13
- **Build Tool:** Vite 6.0.7+
- **Static Site:** Astro
- **Styling:** SCSS

Backend

- **Database:** SQLite (development)
- **ORM:** Prisma v7.3.0
- **Database Driver:** better-sqlite3 with adapter pattern
- **Schema:** Modular multi-file structure

### Development Tools

- **Bundler:** Vite
- **Type Checking:** vue-tsc, tsc
- **Module Resolution:** pnpm workspaces

## Conventions

### Package Names

- Apps: kebab-case names (admin-panel, warehouse-app)
- Packages: scope @store-system with kebab-case (@store-system/ui-components)

### File Structure

- `src/` - Source code
- `dist/` - Compiled files (do not commit)
- `public/` - Static assets (apps only)

### Commits

Recommended to follow Conventional Commits:

```
feat(api): add user authentication endpoint
fix(ui-components): correct button hover state
docs(readme): update installation steps
```

## Additional Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
