# Security & Authentication

This document outlines the security measures implemented in the API, specifically focusing on CSRF protection.

## CSRF Protection

We use a **Double Submit Cookie** pattern to protect against Cross-Site Request Forgery (CSRF) attacks.

### Mechanism

1.  **HttpOnly Cookie**: When a user visits the site or hits the API, we set a `csrfToken` cookie. This cookie is `httpOnly`, meaning it **cannot** be read by JavaScript (preventing XSS attacks from stealing it).
2.  **CSRF Header**: To validate the request, the client must send the _same_ token value in a custom header `x-csrf-token`.
3.  **Validation**: The server compares the cookie value with the header value. If they match, the request is authorized.

### Authentication Flow

Since the frontend cannot read the `httpOnly` cookie directly, it must first **fetch** the token value from the server before making any state-changing requests (POST, PUT, DELETE).

#### 1. Fetch the Token

Make a `GET` request to the token endpoint. The server will return the token in the response body.

- **Endpoint**: `GET /api/v1/auth/csrf-token`
- **Response**: `{ "csrfToken": "..." }`

#### 2. Send in Headers

Include the token in the `x-csrf-token` header for your login or mutation requests.

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
