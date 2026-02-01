# Sistema de Tienda Monorepo

Sistema de gestión de tienda con múltiples aplicaciones y paquetes compartidos.

## Estructura del Proyecto

### Aplicaciones (apps/)

- **admin-panel** - Panel de administración para la gestión del sistema (Vue 3 + Vite)
- **store-front** - Aplicación web para clientes finales (Vue 3 + Vite)
- **warehouse-app** - Aplicación de gestión de almacén (Vue 3 + Vite)
- **landing-page** - Sitio de marketing público (Astro)
- **api** - API REST Backend (Node.js + TypeScript)

### Paquetes Compartidos (packages/)

- **@store-system/types** - Tipos TypeScript compartidos entre proyectos
- **@store-system/db** - Cliente de base de datos Prisma ORM v7 con SQLite, esquemas modulares y hash automático de contraseñas
- **@store-system/ui-components** - Librería de componentes Vue reutilizables
- **@store-system/ui-theme** - Tokens de diseño y estilos compartidos (SCSS)
- **@store-system/tsconfig** - Configuraciones base de TypeScript para el monorepo

## Documentación

- [Configuración de Base de Datos](./docs/database.md) - Configuración de base de datos, configuración de esquemas y uso de Prisma ORM v7
- [Modelos de Base de Datos](./docs/models.md) - Definiciones de modelos de datos y relaciones

## Inicio Rápido

### Prerrequisitos

- Node.js v18 o superior
- pnpm v8 o superior

### Instalación

```bash
# Instalar todas las dependencias del monorepo
pnpm install
```

```bash
# Construir todos los paquetes compartidos
pnpm build
```

```bash
# Configurar base de datos (solo la primera vez)
pnpm db:generate
pnpm db:migrate --name init_auth_and_hr
```

### Comandos Disponibles

```bash
# Desarrollo - Iniciar todos los servicios en modo watch
pnpm dev
```

```bash
# Construcción - Construir todos los paquetes y aplicaciones
pnpm build
```

```bash
# Verificación de Tipos - Verificar tipos TypeScript en todo el monorepo
pnpm type-check
```

```bash
# Limpiar - Eliminar todos los artefactos de construcción
pnpm clean
```

### Scripts de Desarrollo para Apps Individuales

```bash
# Ejecutar aplicaciones individuales (usar flag -w para ejecutar desde la raíz)
pnpm -w run dev:admin       # Panel de Admin
```

```bash
pnpm -w run dev:api         # Servidor API
```

```bash
pnpm -w run dev:store       # Tienda Frontal (POS)
```

```bash
pnpm -w run dev:warehouse   # App de Almacén
```

```bash
pnpm -w run dev:landing     # Landing Page
```

```bash
# Comandos rápidos de base de datos
pnpm -w run db:generate     # Generar Cliente Prisma
```

```bash
pnpm -w run db:migrate      # Crear y aplicar migración
```

```bash
pnpm -w run db:studio       # Abrir Prisma Studio
```

### Trabajando con Paquetes Específicos

```bash
# Ejecutar un comando en un paquete específico
pnpm --filter @store-system/types build
pnpm --filter @store-system/ui-components dev

# Ejecutar en una aplicación específica
pnpm --filter @store-system/admin-panel dev

# Comandos de base de datos
pnpm --filter @store-system/db exec prisma generate
pnpm --filter @store-system/db exec prisma studio
```

## Base de Datos

El proyecto usa Prisma ORM v7 con SQLite en una arquitectura de base de datos compartida. Todas las aplicaciones acceden al mismo archivo `dev.db` ubicado en la raíz del monorepo.

### Comandos Rápidos de Base de Datos

```bash
# Generar Cliente Prisma
pnpm -w run db:generate

# Crear/aplicar migraciones
pnpm -w run db:migrate --name <nombre_migracion>

# Abrir GUI de base de datos
pnpm -w run db:studio

# Resetear base de datos (elimina todos los datos)
pnpm --filter @store-system/db exec prisma migrate reset
```

Ver [docs/database.md](./docs/database.md) para instrucciones detalladas de configuración y detalles de configuración de Prisma 7.

## Configuración de TypeScript

El monorepo utiliza configuraciones compartidas de TypeScript ubicadas en `packages/tsconfig/`:

- **base.json** - Configuración base con reglas estrictas para todos los proyectos
- **vue.json** - Configuración específica para apps Vue con Vite
- **node.json** - Configuración para proyectos Node.js/backend
- **astro.json** - Configuración para proyectos Astro
- **library.json** - Configuración para librerías/paquetes compartidos

Cada proyecto extiende estas configuraciones usando rutas relativas:

```json
{
  "extends": "../../packages/tsconfig/vue.json",
  "compilerOptions": {
    // Configuraciones específicas del proyecto
  }
}
```

## Desarrollo de Paquetes

### Añadiendo Dependencias del Workspace

```bash
# Añadir un paquete del workspace a otro
pnpm --filter @store-system/api add @store-system/types@workspace:*
pnpm --filter @store-system/admin-panel add @store-system/ui-components@workspace:*
```

### Añadiendo Dependencias Externas

```bash
# Añadir una dependencia a un paquete específico
pnpm --filter @store-system/api add express
pnpm --filter @store-system/types add -D typescript
```

### Diseño de Paquete Compartido

```
packages/types/
├── src/
│   ├── index.ts        # Punto de entrada principal
│   ├── user.ts         # Tipos relacionados con usuarios
│   └── product.ts      # Tipos relacionados con productos
├── dist/               # Archivos compilados (generados)
├── package.json        # Configuración del paquete
└── tsconfig.json       # Configuración de TypeScript
```

## Arquitectura Monorepo

### Gestión de Dependencias

- **pnpm workspaces** - Gestión eficiente de dependencias compartidas
- **workspace:** - Referencias entre paquetes del monorepo

### Construcción y Caché

- **Turborepo** - Sistema de construcción incremental con caché inteligente
- Pipelines de construcción configurados en `turbo.json`
- Caché local para acelerar reconstrucciones

### Tipos Compartidos

El paquete `@store-system/types` proporciona tipos comunes:

```typescript
import type { User, Product } from "@store-system/types";
```

### Acceso a Base de Datos

El paquete `@store-system/db` proporciona acceso a base de datos con tipado seguro:

```typescript
import { prisma } from "@store-system/db";

// Consultas tipadas con autocompletado
const users = await prisma.user.findMany({
  include: { employee: true },
});
```

Todos los modelos de Prisma están automáticamente tipados y disponibles en todo el monorepo.

### Componentes Compartidos

El paquete `@store-system/ui-components` exporta componentes Vue:

```typescript
import { Button } from "@store-system/ui-components";
```

## Próximos Pasos

### Infraestructura Base

- [x] Configurar ORM (Prisma v7) en `@store-system/db`
- [x] Arquitectura de esquema modular (auth, hr, sales, inventory)
- [ ] Implementar API con un framework (Express/Fastify/Hono)
- [ ] Configurar variables de entorno (.env y validación)
- [ ] Configurar Docker para desarrollo local

### Calidad de Código

- [ ] Configurar ESLint con reglas compartidas
- [ ] Configurar Prettier para formato consistente
- [ ] Configurar Husky para hooks de git
- [ ] Implementar linting pre-commit

### Pruebas

- [ ] Configurar Vitest para pruebas unitarias
- [ ] Configurar Playwright para pruebas E2E
- [ ] Añadir pruebas para paquetes críticos
- [ ] Configurar reportes de cobertura

### CI/CD

- [ ] Configurar GitHub Actions / GitLab CI
- [ ] Pipeline de pruebas automático
- [ ] Construcción y despliegue automático
- [ ] Versionado semántico y changelogs

## Stack Tecnológico

### Núcleo

- **Gestor de Paquetes:** pnpm 10.19.0
- **Sistema de Construcción:** Turborepo 2.7.6
- **Runtime:** Node.js v25+
- **Lenguaje:** TypeScript 5.7.3

### Frontend

- **Framework:** Vue 3.5.13
- **Herramienta de Construcción:** Vite 6.0.7+
- **Sitio Estático:** Astro
- **Estilos:** SCSS

### Backend

- **Base de Datos:** SQLite (desarrollo)
- **ORM:** Prisma v7.3.0
- **Driver de Base de Datos:** better-sqlite3 con patrón adaptador
- **Seguridad:** bcrypt para hash de contraseñas
- **Esquema:** Estructura modular multi-archivo

### Herramientas de Desarrollo

- **Empaquetador:** Vite
- **Verificación de Tipos:** vue-tsc, tsc
- **Resolución de Módulos:** pnpm workspaces

## Convenciones

### Nombres de Paquetes

- Apps: nombres en kebab-case (admin-panel, warehouse-app)
- Paquetes: scope @store-system con kebab-case (@store-system/ui-components)

### Estructura de Archivos

- `src/` - Código fuente
- `dist/` - Archivos compilados (no comitear)
- `public/` - Activos estáticos (solo apps)

### Commits

Se recomienda seguir Conventional Commits:

```
feat(api): add user authentication endpoint
fix(ui-components): correct button hover state
docs(readme): update installation steps
```

## Recursos Adicionales

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Documentación de Turborepo](https://turbo.build/repo/docs)
- [Documentación de Vue 3](https://vuejs.org/)
- [Documentación de Vite](https://vitejs.dev/)
