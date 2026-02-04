# Security & Authentication

This document outlines the security measures implemented in the API, focusing on **CSRF protection** and **JWT-based authentication** with stateless session management following 2026 standards.

## CSRF Protection

We use a **Double Submit Cookie** pattern to protect against Cross-Site Request Forgery (CSRF) attacks.

### Implementation Strategy

The logic is segmented into three specialized functions in `src/middleware/csrfMiddleware.ts`:

1. **`csrfMiddleware`**: The global initializer. It generates the token using `tokens.create(secret)` and sets it in a `httpOnly`, `secure`, `sameSite: lax` cookie.
2. **`verifyCsrfToken`**: The strict validator. It intercepts write methods (POST, PUT, DELETE, PATCH) and compares the cookie value against the `x-csrf-token` header.
3. **`rotateCsrfToken`**: The rotation utility. Used during critical events like **Login** to assign a new secret and token, mitigating Session Fixation attacks.

### Validation Logic

1.**HttpOnly Cookie**: The server sets a `csrfToken` cookie (not accessible to JS). 2. **CSRF Header**: The client sends the token value in the `x-csrf-token` header. 3. **Verification**: The `verifyCsrfToken` middleware ensures they match before allowing the request to proceed.

---

## JWT Authentication (Session Management)

We implement **stateless authentication** using JSON Web Tokens (JWT) stored securely in `httpOnly` cookies.

### Implementation Details

#### 1. Token Generation (`utils/jwt.ts`)

Centralized helper for JWT operations:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
```

#### 2. Secure Storage

- **Cookie Type**: `httpOnly` (not accessible to JavaScript, prevents XSS).
- **Secure Flag**: Enabled in production (requires HTTPS).
- **SameSite**: Set to `'lax'` to mitigate CSRF attacks while allowing navigation.
- **Expiration**: Configurable via `JWT_EXPIRATION` environment variable.

#### 3. Authentication Middleware (`middleware/authMiddleware.ts`)

The "gatekeeper" of protected routes:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

**Flow**:
1. Extract `token` cookie from request.
2. Verify JWT signature using `JWT_SECRET`.
3. Inject `user` object into Express Request.
4. Block access if token is invalid or expired.

#### 4. Type Safety (`types/express.d.ts`)

Extend Express Request interface for TypeScript:

```typescript
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
    csrfToken?: string;
  }
}
```

### Protected Routes

Apply the `authenticate` middleware to routes requiring authentication:

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getCurrentUser } from '../controllers/authController';

const router = Router();

// Public route
router.post('/login', loginController);

// Protected route
router.get('/me', authenticate, getCurrentUser);

export default router;
```

### Login Flow

**Endpoint**: `POST /api/v1/auth/login`

**Steps**:
1. Validate credentials using `express-validator` rules at route level.
2. Verify user exists and email is verified.
3. Generate JWT with user payload (id, email, role).
4. Set JWT in `httpOnly` cookie.
5. Rotate CSRF token to prevent Session Fixation.
6. Return success response with new CSRF token.

**Response**:
```json
{
  "message": "Login successful",
  "csrfToken": "new-csrf-token-value",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

## Development & Testing (Postman)

To facilitate API testing without a frontend, we use Postman scripts:

1. **Auto-Capture**: A Global Post-response script captures the `csrfToken` from the response body of `GET /auth/csrf-token` or valid login responses.
   ```javascript
   // Postman Tests tab
   var jsonData = pm.response.json();
   if (jsonData.csrfToken) {
     pm.environment.set("csrfToken", jsonData.csrfToken);
   }
   ```
2. **Dynamic Header**: Requests include the `x-csrf-token` header set to `{{csrfToken}}`.
3. **Cookie Handling**: Postman automatically manages cookies, including the `token` cookie for JWT.

### Complete Authentication Flow

#### Client Initialization

1. **Fetch CSRF Token**: Before making any requests, fetch the CSRF token.
   - **Endpoint**: `GET /api/v1/auth/csrf-token`
   - **Response**: `{ "csrfToken": "..." }`

2. **Store CSRF Token**: Save the token in application state (e.g., Vue ref, React state).

#### Login Flow

1. **Submit Credentials**: Send login request with CSRF token in header.
   - **Endpoint**: `POST /api/v1/auth/login`
   - **Headers**: `x-csrf-token: <token>`
   - **Body**: `{ "email": "...", "password": "..." }`

2. **Receive JWT**: Server validates credentials and returns:
   - **Cookie**: `token` (httpOnly JWT)
   - **Response Body**: New `csrfToken` and user data

3. **Update CSRF Token**: Replace the stored CSRF token with the new rotated value.

#### Authenticated Requests

1. **Include CSRF Header**: All mutation requests must include `x-csrf-token`.
2. **JWT Cookie Automatic**: Browser automatically sends the `token` cookie with each request.
3. **Server Validation**: 
   - `authenticate` middleware validates JWT.
   - `verifyCsrfToken` validates CSRF header.

#### Protected Route Access

- **Endpoint**: `GET /api/v1/auth/me`
- **Requirements**: Valid JWT in cookie (no CSRF needed for GET)
- **Response**: Current user's identity

### Frontend Example (Vue.js)

```javascript
<script setup lang="ts">
import { ref, onMounted } from "vue";

const email = ref("");
const password = ref("");
const csrfToken = ref<string | null>(null);

// 1. Fetch the token on component mount
onMounted(async () => {
  try {
    const response = await fetch("/api/v1/auth/csrf-token");
    const data = await response.json();
    csrfToken.value = data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
  }
});

const handleSubmit = async () => {
  if (!csrfToken.value) {
    alert("Secure connection not established. Please reload.");
    return;
  }

  try {
    // 2. Send token in headers
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken.value,
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    if (response.ok) {
      console.log("Login successful");
    } else {
      console.error("Login failed");
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- ... inputs ... -->
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button type="submit" :disabled="!csrfToken">Login</button>
  </form>
</template>
```
