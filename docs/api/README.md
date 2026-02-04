# API Documentation (@store-system/api)

This section contains the documentation for the backend API of the Store System.

## Contents

- [**Architecture**](./architecture.md)
  - Explanation of the Layered Architecture pattern
  - Directory structure and responsibilities

- [**Implementation Roadmap**](./implementation-roadmap.md)
  - Step-by-step guide to building the API Foundation
  - Boilerplate, Security (CSRF), and Utilities

- [**Security**](./security.md)
  - CSRF implementation details (Double Submit Cookie)
  - Authentication flows and best practices

- [**Dependencies**](./dependencies.md)
  - List of required production and development packages

### System Documentation

- [**Database Schema**](../database.md)
  - Overview of the database structure and connections
- [**Data Models**](../models.md)
  - Detailed entities and relationships
- [**Requirements**](../requirements.md)
  - Functional and non-functional requirements of the system

## Key Architectural Highlights

### 1. Sistema de Sesiones (JWT + Cookies)

- **Gestión de Identidad**: Implementación de JSON Web Tokens (JWT) para el manejo de sesiones sin estado (stateless).
- **Almacenamiento Seguro**: El JWT no se expone al JavaScript del cliente; se almacena en una cookie de tipo `httpOnly`, con flag `secure` en producción y `sameSite: 'lax'` para mitigar ataques XSS y CSRF.
- **Helper de Firma**: Se centralizó la creación de tokens en `utils/jwt.ts` usando una clave secreta (`JWT_SECRET`) y tiempos de expiración configurables desde el entorno.
- **Endpoints Protegidos**: Las rutas privadas requieren el token JWT válido para acceder a recursos autenticados.

### 2. Capa de Seguridad (CSRF)

- **Double Submit Cookie Pattern**: Implementation split into three specialized functions:
  - `csrfMiddleware`: Global initializer (generates token, sets httpOnly cookie).
  - `verifyCsrfToken`: Strict validator for write methods (POST, PUT, DELETE, PATCH).
  - `rotateCsrfToken`: Token rotation for critical events (e.g., Login) to prevent Session Fixation.
- **Type Integration**: Extended Express Request interface for `csrfToken` property.

### 3. Middleware de Autenticación (authenticate)

- **El Portero de la API**: Middleware global en `middleware/authMiddleware.ts` que intercepta peticiones a rutas protegidas.
- **Flujo de Verificación**: Extrae la cookie `token`, valida la firma con `jsonwebtoken` e inyecta el objeto `user` (id, email, role) directamente en el Request de Express.
- **Extensión de Tipos**: Se actualizó `src/types/express.d.ts` para que TypeScript reconozca `req.user` y `req.csrfToken`.
- **Protección Granular**: Las rutas pueden ser protegidas individualmente aplicando el middleware `authenticate`.

### 4. Refactorización de Arquitectura

- **Validación en Rutas**: Las reglas de `express-validator` se han movido de los controladores a los archivos de rutas (e.g., `userRoutes.ts`), actuando como filtros de entrada.
- **Controladores "Lean"**: Los controladores ahora solo gestionan la lógica de orquestación y las respuestas HTTP, delegando la validación y la seguridad a los middlewares.
- **Endpoints Implementados**:
  - `GET /api/v1/auth/csrf-token`: Entrega el token inicial.
  - `POST /api/v1/auth/login`: Valida credenciales, emite JWT y rota el CSRF.
  - `GET /api/v1/auth/me`: Ruta protegida que devuelve la identidad del usuario activo.

### 5. Automatización de Entorno (Postman)

- **Auto-Capture**: Scripts de Post-response configurados para capturar el `csrfToken` automáticamente en variables de entorno.
- **Flujo sin Fricción**: Permite pruebas fluidas sin intervención manual, mejorando la experiencia de desarrollo.
- **Dynamic Headers**: Pre-configured `x-csrf-token` header using `{{csrfToken}}`.

## Pending Tasks

> Check the [Implementation Roadmap](./implementation-roadmap.md) to see the verified progress and what features are currently missing.
