# ft_transcendence — API Documentation

> **Base URL:** `https://localhost` (via Nginx reverse proxy)  
> **Date:** February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Auth Service — `/api/auth`](#auth-service)
4. [User Management Service — `/api/users`](#user-management-service)
5. [User Model Reference](#user-model-reference)
6. [Error Handling](#error-handling)

---

## Overview

The backend is split into microservices, each behind an Nginx reverse proxy over HTTPS (TLS 1.2/1.3).

| Service          | Proxy Route     | Internal Host | Internal Port |
|------------------|-----------------|---------------|---------------|
| Auth             | `/api/auth/`    | `auth`        | 3004          |
| User Management  | `/api/users/`   | `user`        | 3002          |
| Chat             | `/api/chat/`    | `chat`        | 3001          |
| Frontend         | `/`             | `front`       | 3003          |

- All request/response bodies are **JSON** (`Content-Type: application/json`).
- Validation is enforced server-side. Unknown fields are rejected (`forbidNonWhitelisted`).

---

## Authentication

Protected routes require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The token is a JWT signed with a shared secret, valid for **7 days**.

**Decoded JWT payload (`req.user`):**

| Field      | Type   | Description                |
|------------|--------|----------------------------|
| `userId`   | number | User's database ID (`sub`) |
| `email`    | string | User's email               |
| `username` | string | User's username            |

---

## Auth Service

**Prefix:** `/api/auth`

### 1. Health Check

```
GET /api/auth
```

**Auth required:** No

**Response:** `200 OK`
```
"Hello from Auth Service!"
```

---

### 2. Sign Up

```
POST /api/auth/signup
```

**Auth required:** No

**Request Body:**

| Field       | Type   | Required | Validation                                                             |
|-------------|--------|----------|------------------------------------------------------------------------|
| `email`     | string | Yes      | Must be a valid email                                                   |
| `username`  | string | Yes      | Min 3 characters                                                        |
| `password`  | string | Yes      | Min 8 characters; must contain uppercase, lowercase, and a number       |
| `firstName` | string | No       | —                                                                       |
| `lastName`  | string | No       | —                                                                       |

**Example Request:**
```json
{
  "email": "player@example.com",
  "username": "player42",
  "password": "Secret123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "player@example.com",
    "username": "player42",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "default-avatar.png",
    "bio": null,
    "googleId": null,
    "intra42Id": null,
    "isOnline": false,
    "isVerified": false,
    "isActive": true,
    "lastSeenAt": "2026-02-22T10:00:00.000Z",
    "createdAt": "2026-02-22T10:00:00.000Z",
    "updatedAt": "2026-02-22T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition                       | Body                                                    |
|--------|---------------------------------|---------------------------------------------------------|
| 400    | Validation failed               | `{ "message": ["<validation errors>"], "error": "Bad Request" }` |
| 409    | Email or username already taken | `{ "message": "Email or username already exists" }`     |

---

### 3. Log In

```
POST /api/auth/login
```

**Auth required:** No

**Request Body:**

| Field      | Type   | Required | Validation          |
|------------|--------|----------|---------------------|
| `email`    | string | Yes      | Must be a valid email |
| `password` | string | Yes      | Non-empty string    |

**Example Request:**
```json
{
  "email": "player@example.com",
  "password": "Secret123"
}
```

**Success Response:** `201 Created`
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "player@example.com",
    "username": "player42",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "default-avatar.png",
    "bio": null,
    "googleId": null,
    "intra42Id": null,
    "isOnline": false,
    "isVerified": false,
    "isActive": true,
    "lastSeenAt": "2026-02-22T10:00:00.000Z",
    "createdAt": "2026-02-22T10:00:00.000Z",
    "updatedAt": "2026-02-22T10:00:00.000Z"
  }
}
```

> **Important:** Store `access_token` and send it as `Authorization: Bearer <token>` on all protected requests.

**Error Responses:**

| Status | Condition              | Body                                           |
|--------|------------------------|-------------------------------------------------|
| 400    | Validation failed      | `{ "message": ["<validation errors>"], "error": "Bad Request" }` |
| 401    | Wrong email or password | `{ "message": "Invalid credentials" }`         |

---

### 4. Get Auth Profile (Token Verification)

```
GET /api/auth/profile
```

**Auth required:** Yes (`Bearer` token)

**Success Response:** `200 OK`
```json
{
  "message": "This is a protected route!",
  "user": {
    "userId": 1,
    "email": "player@example.com",
    "username": "player42"
  }
}
```

> Useful for verifying a stored token is still valid and retrieving the basic identity from the JWT.

**Error Responses:**

| Status | Condition         | Body                              |
|--------|-------------------|-----------------------------------|
| 401    | Missing/invalid/expired token | `{ "message": "Unauthorized" }` |

---

## User Management Service

**Prefix:** `/api/users`

All endpoints in this service are **protected** (require `Authorization: Bearer <token>`).

### 1. Health Check

```
GET /api/users
```

**Auth required:** No

**Response:** `200 OK`
```
"Hello from User Management Service!"
```

---

### 2. Get Current User Profile

```
GET /api/users/me
```

**Auth required:** Yes

Returns the full profile of the currently authenticated user (identified by the JWT).

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "email": "player@example.com",
  "username": "player42",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "default-avatar.png",
  "bio": null,
  "googleId": null,
  "intra42Id": null,
  "isOnline": false,
  "isVerified": false,
  "isActive": true,
  "lastSeenAt": "2026-02-22T10:00:00.000Z",
  "createdAt": "2026-02-22T10:00:00.000Z",
  "updatedAt": "2026-02-22T10:00:00.000Z"
}
```

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 401    | Unauthorized | `{ "message": "Unauthorized" }` |
| 404    | User not found | `{ "message": "User not found" }` |

---

### 3. Get User by ID

```
GET /api/users/:id
```

**Auth required:** Yes

**Path Parameters:**

| Param | Type   | Description             |
|-------|--------|-------------------------|
| `id`  | number | The user's database ID  |

**Success Response:** `200 OK`
```json
{
  "id": 2,
  "email": "other@example.com",
  "username": "other42",
  "firstName": "Jane",
  "lastName": "Smith",
  "avatar": "default-avatar.png",
  "bio": "Hello world",
  "isOnline": true,
  "isVerified": false,
  "createdAt": "2026-02-20T08:00:00.000Z"
}
```

> **Note:** This endpoint returns a **limited set of fields** (no `password`, `googleId`, `intra42Id`, etc.).

**Error Responses:**

| Status | Condition          | Body                              |
|--------|--------------------|-----------------------------------|
| 400    | Invalid ID format  | `{ "message": "Validation failed (numeric string is expected)" }` |
| 401    | Unauthorized       | `{ "message": "Unauthorized" }`   |
| 404    | User not found     | `{ "message": "User not found" }` |

---

### 4. Update Profile

```
PATCH /api/users/profile
```

**Auth required:** Yes

Updates the authenticated user's profile. Only send the fields you want to change.

**Request Body (all fields optional):**

| Field       | Type   | Validation                  |
|-------------|--------|-----------------------------|
| `username`  | string | Min 3, max 20 characters    |
| `firstName` | string | Max 50 characters           |
| `lastName`  | string | Max 50 characters           |
| `bio`       | string | Max 500 characters          |

**Example Request:**
```json
{
  "username": "newname42",
  "bio": "Pong champion"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "player@example.com",
    "username": "newname42",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "default-avatar.png",
    "bio": "Pong champion",
    "googleId": null,
    "intra42Id": null,
    "isOnline": false,
    "isVerified": false,
    "isActive": true,
    "lastSeenAt": "2026-02-22T10:00:00.000Z",
    "createdAt": "2026-02-22T10:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition              | Body                                    |
|--------|------------------------|-----------------------------------------|
| 400    | Validation failed      | `{ "message": ["..."], "error": "Bad Request" }` |
| 401    | Unauthorized           | `{ "message": "Unauthorized" }`         |
| 409    | Username already taken  | `{ "message": "Username already taken" }` |

---

### 5. Change Password

```
PATCH /api/users/password
```

**Auth required:** Yes

**Request Body:**

| Field             | Type   | Required | Validation                                                       |
|-------------------|--------|----------|------------------------------------------------------------------|
| `currentPassword` | string | Yes      | Non-empty string                                                  |
| `newPassword`     | string | Yes      | Min 8 characters; must contain uppercase, lowercase, and a number |

**Example Request:**
```json
{
  "currentPassword": "Secret123",
  "newPassword": "NewSecret456"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Status | Condition                | Body                                       |
|--------|--------------------------|---------------------------------------------|
| 400    | Validation failed        | `{ "message": ["..."], "error": "Bad Request" }` |
| 401    | Current password wrong   | `{ "message": "Current password is incorrect" }` |
| 401    | Unauthorized (no token)  | `{ "message": "Unauthorized" }`             |
| 404    | User not found           | `{ "message": "User not found" }`           |

---

## User Model Reference

The `User` model stored in PostgreSQL:

| Field        | Type     | Default              | Notes                        |
|--------------|----------|----------------------|------------------------------|
| `id`         | int      | Auto-increment       | Primary key                  |
| `email`      | string   | —                    | Unique                       |
| `username`   | string   | —                    | Unique                       |
| `password`   | string?  | —                    | Nullable (OAuth users)       |
| `firstName`  | string?  | null                 |                              |
| `lastName`   | string?  | null                 |                              |
| `avatar`     | string?  | `"default-avatar.png"` |                            |
| `bio`        | string?  | null                 |                              |
| `googleId`   | string?  | null                 | Unique, for Google OAuth     |
| `intra42Id`  | string?  | null                 | Unique, for 42 Intra OAuth   |
| `isOnline`   | boolean  | `false`              |                              |
| `isVerified` | boolean  | `false`              |                              |
| `isActive`   | boolean  | `true`               |                              |
| `lastSeenAt` | datetime | `now()`              |                              |
| `createdAt`  | datetime | `now()`              |                              |
| `updatedAt`  | datetime | Auto-updated         |                              |

---

## Error Handling

All errors follow a consistent NestJS format:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

For validation errors the `message` field is an array of human-readable strings:

```json
{
  "statusCode": 400,
  "message": [
    "Password must be at least 8 characters long",
    "Password must contain uppercase, lowercase, and number"
  ],
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning               | Typical Cause                              |
|------|-----------------------|--------------------------------------------|
| 200  | OK                    | Successful GET/PATCH                       |
| 201  | Created               | Successful POST (signup, login)            |
| 400  | Bad Request           | Validation failed or malformed body        |
| 401  | Unauthorized          | Missing/invalid/expired token or wrong password |
| 404  | Not Found             | User ID does not exist                     |
| 409  | Conflict              | Duplicate email or username                |

---

## Quick Reference — All Endpoints

| Method  | Endpoint              | Auth | Description                  |
|---------|-----------------------|------|------------------------------|
| `GET`   | `/api/auth`           | No   | Auth health check            |
| `POST`  | `/api/auth/signup`    | No   | Register a new user          |
| `POST`  | `/api/auth/login`     | No   | Log in, receive JWT          |
| `GET`   | `/api/auth/profile`   | Yes  | Verify token / get identity  |
| `GET`   | `/api/users`          | No   | User service health check    |
| `GET`   | `/api/users/me`       | Yes  | Get current user's profile   |
| `GET`   | `/api/users/:id`      | Yes  | Get any user by ID           |
| `PATCH` | `/api/users/profile`  | Yes  | Update current user's profile |
| `PATCH` | `/api/users/password` | Yes  | Change password              |
