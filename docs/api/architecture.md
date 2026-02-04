# API Architecture

The API follows a [**Layered Architecture**](https://dev.to/yasmine_ddec94f4d4/understanding-the-layered-architecture-pattern-a-comprehensive-guide-1e2j) pattern. This separates the "shape" of the application (handling requests) from the "content" (business logic), ensuring modularity and easier maintenance.

## Directory Structure

```plaintext
apps/api/
├── src/
│   ├── config/          # Environment variables and constants
│   ├── controllers/     # Orchestrators: receive req, call services, return res
│   ├── middlewares/     # CSRF, JWT validation, global error handling
│   ├── routes/          # Endpoint definitions (index.ts, auth.routes.ts, etc.)
│   ├── services/        # Pure business logic (uses @store-system/db)
│   ├── utils/           # Helpers (token generators, nodemailer config)
│   ├── types/           # TypeScript type extensions (e.g. req.user, req.csrfToken)
│   └── server.ts        # Application entry point
├── package.json
└── tsconfig.json
```

## Layer Descriptions

### 1. Controllers

Controllers act as the entry point for requests. They bridge the gap between the HTTP layer and the business logic.

- **Responsibility:** Orchestrate business logic and manage HTTP responses.
- **Rule:** Controllers are "Lean". They should NOT contain validation logic (handled by route middleware) or direct database queries.
- **Refactorización 2026**: Los controladores se han limpiado completamente de lógica de validación, la cual ahora reside en los archivos de rutas como middleware.

### 2. Services

Services contain the core business logic of the application.

- **Responsibility:** Execute logic, communicate with the database (via `@store-system/db`), and return data to the controller.
- **Rule:** Services should be framework-agnostic (no `req` or `res` objects).

### 3. Middlewares

Functions that run before the controller logic.

- **Examples:** 
  - **CSRF Protection**: Triple-layer pattern (`csrfMiddleware`, `verifyCsrfToken`, `rotateCsrfToken`).
  - **JWT Authentication**: `authenticate` middleware extracts and validates JWT from `httpOnly` cookies.
  - **Request Validation**: `express-validator` rules applied at route level.
  - **Error Logging**: Global error handler for consistent error responses.

#### Middleware de Autenticación (authenticate)

El middleware `authenticate` actúa como el "portero" de la API:

1. **Extracción**: Lee la cookie `token` del request.
2. **Validación**: Verifica la firma JWT usando `jsonwebtoken` y `JWT_SECRET`.
3. **Inyección**: Añade el objeto `user` (id, email, role) al `req` de Express.
4. **Protección**: Bloquea el acceso si el token es inválido o ha expirado.

### 4. Utils

Helper functions and shared utilities.

- **Examples:** 
  - `mailer.ts`: Nodemailer wrapper for transactional emails.
  - `jwt.ts`: Centralized JWT signing and verification using `JWT_SECRET` and configurable expiration times.
  - Built-in validators for common patterns.

### 5. Config

Centralized configuration management.

- **Purpose:** Store environment variables (e.g., specific ports, API keys, `JWT_SECRET`) and validation logic to fail fast if configuration is missing.

### 6. Types

TypeScript type definitions and extensions.

- **Express Extensions**: `src/types/express.d.ts` extends the Express Request interface to include:
  - `req.user`: Object containing authenticated user data (id, email, role).
  - `req.csrfToken`: CSRF token string for validation.
- **Type Safety**: Ensures TypeScript recognizes custom properties added by middlewares.
