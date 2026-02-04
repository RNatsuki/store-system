# API Implementation Map

This roadmap outlines the steps to build the API foundation, focusing on security and structure first.

## Phase 1: Foundation & Security

**Goal:** Establish a secure base with CSRF protection, Type-Safe boilerplate, and essential utilities.

### Step 1: Dependencies

- [x] Install all required dependencies (see [dependencies.md](./dependencies.md)).

### Step 2: Architecture Setup

- [x] Create the folder structure defined in [architecture.md](./architecture.md).

### Step 3: Type Definitions & CSRF

Your custom CSRF middleware needs to be compatible with TypeScript.

- [x] Create `src/types/express.d.ts`.
- [x] Extend the Express interface:

```typescript
declare namespace Express {
  export interface Request {
    csrfToken?: string;
  }
}
```

- [x] Implement the segmented CSRF logic:
  - `csrfMiddleware` (Token generation & cookie setting).
  - `verifyCsrfToken` (Header validation for mutations).
  - `rotateCsrfToken` (Session fixation protection).

### Step 4: Express Boilerplate (`server.ts`)

Set up the main application entry point.

- [x] Initialize `express`.
- [x] Configure global middlewares:
  - `helmet()` (Security headers)
  - `cors()` (Cross-origin requests)
  - `express.json()` (Body parsing)
  - `cookie-parser()` (Cookie parsing)
- [x] Inject your custom implementation of `csrfMiddleware`.

### Step 5: Mailer Utility

Prepare the system for sending transactional emails (verification, reset password).

- [ ] Create `src/utils/mailer.ts`.
- [ ] specific SMTP transporter configuration.
- [ ] Create a generic `sendEmail` function accepting `template`, `to`, and `subject`.

### Step 6: Security Handshake

- [x] Create the **Handshake Endpoint**: `GET /api/v1/auth/csrf-token`.
- [x] Ensure it returns `{ csrfToken: "..." }`.
- [ ] **Verify:** Use Postman to check that `httpOnly` cookie is set and token is returned.

### Step 7: Validation Infrastructure

- [x] Implement **Route-Level Validation** middleware (removing `.run(req)` from controllers).
- [x] Refactor controllers to be **"Lean"** (business logic orchestration only).

---

## Phase 2: Authentication & Robust Security ✅ COMPLETED

**Goal:** Implement stateless authentication with JWT and enhance security with session management.

### Step 1: JWT Infrastructure

- [x] Create `src/utils/jwt.ts` with centralized token signing and verification.
- [x] Configure `JWT_SECRET` and expiration times from environment variables.
- [x] Implement secure JWT storage in `httpOnly` cookies with `secure` and `sameSite: 'lax'` flags.

### Step 2: Authentication Middleware

- [x] Create `src/middleware/authMiddleware.ts`.
- [x] Implement `authenticate` middleware:
  - Extract JWT from `token` cookie.
  - Verify signature using `jsonwebtoken`.
  - Inject `user` object (id, email, role) into Express Request.
  - Return 401 error for invalid/expired tokens.

### Step 3: Type Extensions

- [x] Update `src/types/express.d.ts` to extend Express Request interface:
  - Add `user` property for authenticated user data.
  - Add `csrfToken` property for CSRF validation.

### Step 4: Authentication Endpoints

- [x] Implement `POST /api/v1/auth/login`:
  - Validate credentials.
  - Generate JWT and set in `httpOnly` cookie.
  - Rotate CSRF token to prevent Session Fixation.
  - Return success response with new CSRF token.
- [x] Implement `GET /api/v1/auth/me`:
  - Protected route using `authenticate` middleware.
  - Return current user's identity (id, email, role).

### Step 5: Route Protection

- [x] Apply `authenticate` middleware to protected routes.
- [x] Ensure validation rules are at route level (not in controllers).
- [x] Test protected endpoints with valid and invalid tokens.

### Step 6: Postman Automation

- [x] Configure Post-response scripts to auto-capture `csrfToken`.
- [x] Set up dynamic headers with environment variables.
- [x] Document testing flow for developers.

---

## Phase 3: Advanced Features (Future)

_To be defined: Password reset, Email verification, Role-based access control (RBAC), Refresh tokens, etc._
