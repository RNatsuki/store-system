# API Implementation Map

This roadmap outlines the steps to build the API foundation, focusing on security and structure first.

## Phase 1: Foundation & Security

**Goal:** Establish a secure base with CSRF protection, Type-Safe boilerplate, and essential utilities.

### Step 1: Dependencies

- [ ] Install all required dependencies (see [dependencies.md](./dependencies.md)).

### Step 2: Architecture Setup

- [ ] Create the folder structure defined in [architecture.md](./architecture.md).

### Step 3: Type Definitions & CSRF

Your custom CSRF middleware needs to be compatible with TypeScript.

- [ ] Create `src/types/express.d.ts`.
- [ ] Extend the Express interface:
  ```typescript
  declare namespace Express {
    export interface Request {
      csrfToken?: string;
    }
  }
  ```
- [ ] Implement the CSRF middleware using strict types (`Request`, `Response`, `NextFunction`).

### Step 4: Express Boilerplate (`server.ts`)

Set up the main application entry point.

- [ ] Initialize `express`.
- [ ] Configure global middlewares:
  - `helmet()` (Security headers)
  - `cors()` (Cross-origin requests)
  - `express.json()` (Body parsing)
  - `cookie-parser()` (Cookie parsing)
- [ ] Inject your custom implementation of `csrfMiddleware`.

### Step 5: Mailer Utility

Prepare the system for sending transactional emails (verification, reset password).

- [ ] Create `src/utils/mailer.ts`.
- [ ] specific SMTP transporter configuration.
- [ ] Create a generic `sendEmail` function accepting `template`, `to`, and `subject`.

### Step 6: Health Check & Verification

- [ ] Create a simple "Health Check" route (e.g., `GET /api/health`).
- [ ] Return the server status and the `csrfToken` in the response body.
- [ ] **Verify:** Ensure the token is generated and cookies are being set correctly.

---

## Phase 2: Authentication (Future)

_To be defined after Phase 1 completion._
