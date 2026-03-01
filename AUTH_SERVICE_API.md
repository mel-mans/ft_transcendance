# Auth Service API Documentation

**Base URL:** `http://localhost:3004/api/auth`  
**Version:** 1.0  
**Service:** Authentication and OAuth

---

## 📋 Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Signup](#signup)
   - [Login](#login)
   - [Protected Route Test](#protected-route-test)
   - [42 OAuth](#42-oauth)
   - [Google OAuth](#google-oauth)
3. [Response Formats](#response-formats)
4. [Error Codes](#error-codes)
5. [JWT Token Usage](#jwt-token-usage)

---

## 🔐 Authentication Flow

### Standard Flow (Email/Password):

1. **Signup** → Create account with email & password
2. **Login** → Receive JWT token
3. **Use Token** → Include in `Authorization` header for protected routes

### OAuth Flow (42/Google):

1. **Redirect to OAuth** → User clicks login button
2. **User Authorizes** → On 42/Google page
3. **Callback** → User redirected back with token
4. **Frontend Receives Token** → Store and use for API calls

---

## 📡 Endpoints

---

### Health Check

Check if the service is running.

**Endpoint:** `GET /`

**Response:**
```json
"Hello from Auth Service!"
```

**Status Codes:**
- `200` - Service is running

**Example:**
```bash
curl http://localhost:3004/api/auth
```

---

### Signup

Create a new user account with email and password.

**Endpoint:** `POST /signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123"
}
```

**Field Requirements:**
- `email` (string, required) - Valid email address
- `password` (string, required) - Minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "username": "user_1709265432",
    "name": null,
    "age": null,
    "avatar": "default-avatar.png",
    "bio": null,
    "isOnline": false,
    "isVerified": false,
    "isActive": true,
    "createdAt": "2026-03-01T04:30:00.000Z",
    "updatedAt": "2026-03-01T04:30:00.000Z"
  }
}
```

**Error Responses:**

**409 Conflict - Email Already Exists:**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

**400 Bad Request - Validation Failed:**
```json
{
  "statusCode": 400,
  "message": [
    "Email must be a valid email",
    "Password must be at least 8 characters long",
    "Password must contain uppercase, lowercase, and number"
  ],
  "error": "Bad Request"
}
```

**Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3004/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3004/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'SecurePass123'
  })
});
const data = await response.json();
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "MyPassword123"
}
```

**Field Requirements:**
- `identifier` (string, required) - Email address OR username
- `password` (string, required) - User's password

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "testuser",
    "name": "John Doe",
    "age": 24,
    "avatar": "default-avatar.png",
    "bio": "42 student",
    "isOnline": true,
    "isVerified": true,
    "createdAt": "2026-02-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**401 Unauthorized - OAuth Account:**
```json
{
  "statusCode": 401,
  "message": "This account uses OAuth login. Please login with 42 or Google.",
  "error": "Unauthorized"
}
```

**Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "SecurePass123"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3004/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'testuser@example.com',
    password: 'SecurePass123'
  })
});
const data = await response.json();
localStorage.setItem('access_token', data.access_token);
```

---

### Protected Route Test

Test JWT authentication (development endpoint).

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "This is a protected route!",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "testuser"
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Examples:**

**cURL:**
```bash
curl http://localhost:3004/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript:**
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:3004/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

---

### 42 OAuth

Authenticate using 42 Intra account.

#### Step 1: Initiate OAuth Flow

**Endpoint:** `GET /42`

**Action:** Redirects user to 42 OAuth authorization page.

**Frontend Implementation:**
```html
<button onclick="window.location.href='http://localhost:3004/api/auth/42'">
  Login with 42
</button>
```

#### Step 2: OAuth Callback

**Endpoint:** `GET /42/callback`

**Note:** Called automatically by 42. Users should not call this directly.

**Flow:**
1. User authorizes on 42 page
2. 42 redirects to `/42/callback`
3. Backend creates/finds user account
4. Backend redirects to frontend with token

**Frontend Handler:**
```javascript
// On /auth/callback page
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (token) {
  localStorage.setItem('access_token', token);
  // Redirect to dashboard
}
```

---

### Google OAuth

Authenticate using Google account.

#### Step 1: Initiate OAuth Flow

**Endpoint:** `GET /google`

**Action:** Redirects user to Google OAuth authorization page.

**Frontend Implementation:**
```html
<button onclick="window.location.href='http://localhost:3004/api/auth/google'">
  Login with Google
</button>
```

#### Step 2: OAuth Callback

**Endpoint:** `GET /google/callback`

**Note:** Called automatically by Google. Users should not call this directly.

**Flow:** Same as 42 OAuth callback.

---

## 📦 Response Formats

### Success Response Structure
```json
{
  "message": "Operation successful",
  "data": { }
}
```

### Error Response Structure
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error Type"
}
```

---

## ⚠️ Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| `400` | Bad Request | Invalid request body or validation failed |
| `401` | Unauthorized | Invalid credentials or missing/invalid token |
| `409` | Conflict | Email or username already exists |
| `500` | Internal Server Error | Server error |

---

## 🔑 JWT Token Usage

### Token Format
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.PAYLOAD.SIGNATURE
```

**Payload Contains:**
```json
{
  "sub": 1,
  "email": "user@example.com",
  "username": "testuser",
  "iat": 1709265432,
  "exp": 1709870232
}
```

### Using the Token

Include in `Authorization` header:
```
Authorization: Bearer <your_token>
```

**Example:**
```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:3002/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Token Expiration

- **Validity:** 7 days
- **After Expiration:** User must login again
- **Storage:** localStorage or httpOnly cookies

---

## 🔄 Complete User Flow Example
```javascript
// 1. Signup
const signupResponse = await fetch('http://localhost:3004/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});

// 2. Login
const loginResponse = await fetch('http://localhost:3004/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'john@example.com',
    password: 'SecurePass123'
  })
});
const { access_token } = await loginResponse.json();
localStorage.setItem('access_token', access_token);

// 3. Access Protected Resources
const token = localStorage.getItem('access_token');
const profileResponse = await fetch('http://localhost:3002/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🔗 Related Services

- **User Management API:** `http://localhost:3002/api/users`
- **Chat Service API:** `http://localhost:3001/api/chat`
- **Listings Service API:** `http://localhost:3005/api/listings`

---

## 📞 Support

**Swagger UI:** http://localhost:3004/api/auth/docs

**Logs:**
```bash
docker-compose logs auth
```

---

**Last Updated:** March 1, 2026  
**Version:** 1.0
