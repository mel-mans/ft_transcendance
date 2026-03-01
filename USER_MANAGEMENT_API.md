# User Management Service API Documentation

**Base URL:** `http://localhost:3002/api/users`  
**Version:** 1.0  
**Service:** User Management, Profiles, and Preferences

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Get Current User](#get-current-user)
   - [Get User by ID](#get-user-by-id)
   - [Complete Profile](#complete-profile)
   - [Update Profile](#update-profile)
   - [Change Password](#change-password)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## 🔍 Overview

The User Management Service handles user profiles, preferences, and profile completion after signup/OAuth. It works in conjunction with the Auth Service to provide a complete user experience.

**Key Features:**
- Profile management (username, name, age, sex, bio)
- User preferences (location, budget, lifestyle)
- Password management
- Profile completion workflow

---

## 🔐 Authentication

All endpoints (except health check) require JWT authentication.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Get Token From:**
- `POST /api/auth/login` (Auth Service)
- `POST /api/auth/signup` (Auth Service)
- OAuth callbacks

---

## 📡 Endpoints

---

### Health Check

Check if the service is running.

**Endpoint:** `GET /`

**Authentication:** None

**Response:**
```json
"Hello from User Management Service!"
```

**Status Codes:**
- `200` - Service is running

**Example:**
```bash
curl http://localhost:3002/api/users
```

---

### Get Current User

Get the authenticated user's profile and preferences.

**Endpoint:** `GET /me`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "age": 24,
  "sex": "male",
  "avatar": "default-avatar.png",
  "bio": "42 student looking for roommate",
  "isOnline": true,
  "isVerified": true,
  "isActive": true,
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z"
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

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

**Examples:**

**cURL:**
```bash
curl http://localhost:3002/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript:**
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:3002/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const user = await response.json();
```

---

### Get User by ID

Get any user's public profile by their ID.

**Endpoint:** `GET /:id`

**Authentication:** Required

**Path Parameters:**
- `id` (number, required) - User ID

**Response (200 OK):**
```json
{
  "id": 2,
  "email": "other@example.com",
  "username": "janedoe",
  "name": "Jane Doe",
  "age": 23,
  "avatar": "default-avatar.png",
  "bio": "Looking for roommate in Casablanca",
  "isOnline": false,
  "isVerified": true,
  "createdAt": "2026-02-15T00:00:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

**Examples:**

**cURL:**
```bash
curl http://localhost:3002/api/users/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Complete Profile

Complete user profile after signup or OAuth login. **All fields required.**

**Endpoint:** `POST /complete-profile`

**Authentication:** Required

**Request Body:**
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "age": 24,
  "sex": "male",
  "bio": "42 student looking for roommate",
  "location": "Casablanca",
  "moveInDate": "2026-04-01",
  "budget": 5000,
  "currency": "MAD",
  "smoker": false,
  "quietHours": true,
  "earlyBird": false,
  "nightOwl": true,
  "petFriendly": true,
  "cooks": true,
  "gamer": true,
  "social": false,
  "studious": true,
  "clean": true
}
```

**Field Requirements:**

**Basic Info (Required):**
- `username` (string, min 3 chars) - Unique username
- `name` (string) - Full name (first and last name)
- `age` (number, 18-100) - User's age
- `sex` (string) - One of: "male", "female", "other"
- `bio` (string) - About you

**Location & Budget (Required):**
- `location` (string) - Preferred location (e.g., "Casablanca")
- `moveInDate` (string, ISO date) - When looking to move (e.g., "2026-04-01")
- `budget` (number) - Monthly budget
- `currency` (string) - One of: "EUR", "USD", "MAD", "GBP", "CHF", "JPY", "CAD", "AUD"

**Lifestyle Preferences (Required, all boolean):**
- `smoker` - Is a smoker
- `quietHours` - Prefers quiet hours
- `earlyBird` - Early riser
- `nightOwl` - Night owl
- `petFriendly` - Likes/has pets
- `cooks` - Cooks regularly
- `gamer` - Plays video games
- `social` - Social/outgoing
- `studious` - Studies a lot
- `clean` - Clean/tidy

**Response (201 Created):**
```json
{
  "message": "Profile completed successfully",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "age": 24,
    "sex": "male",
    "bio": "42 student looking for roommate",
    "avatar": "default-avatar.png",
    "preferences": {
      "id": 5,
      "userId": 5,
      "location": "Casablanca",
      "moveInDate": "2026-04-01T00:00:00.000Z",
      "budget": 5000,
      "currency": "MAD",
      "smoker": false,
      "quietHours": true,
      "earlyBird": false,
      "nightOwl": true,
      "petFriendly": true,
      "cooks": true,
      "gamer": true,
      "social": false,
      "studious": true,
      "clean": true,
      "createdAt": "2026-03-01T00:00:00.000Z",
      "updatedAt": "2026-03-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "statusCode": 400,
  "message": [
    "username should not be empty",
    "name must be a full name (first and last name)",
    "age must not be less than 18",
    "sex must be one of the following values: male, female, other"
  ],
  "error": "Bad Request"
}
```

**409 Conflict - Username Taken:**
```json
{
  "statusCode": 409,
  "message": "Username already taken",
  "error": "Conflict"
}
```

**Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3002/api/users/complete-profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "name": "John Doe",
    "age": 24,
    "sex": "male",
    "bio": "42 student",
    "location": "Casablanca",
    "moveInDate": "2026-04-01",
    "budget": 5000,
    "currency": "MAD",
    "smoker": false,
    "quietHours": true,
    "earlyBird": false,
    "nightOwl": true,
    "petFriendly": true,
    "cooks": true,
    "gamer": true,
    "social": false,
    "studious": true,
    "clean": true
  }'
```

---

### Update Profile

Update user profile and preferences. **All fields optional.**

**Endpoint:** `PATCH /profile`

**Authentication:** Required

**Request Body (all fields optional):**
```json
{
  "username": "newusername",
  "name": "Updated Name",
  "age": 25,
  "sex": "male",
  "bio": "Updated bio",
  "location": "Rabat",
  "moveInDate": "2026-05-01",
  "budget": 6000,
  "currency": "EUR",
  "smoker": false,
  "nightOwl": true,
  "clean": true
}
```

**Note:** You can update just one field or multiple fields. Only send fields you want to change.

**Field Specifications:**
- `username` (string, min 3, max 20 chars, optional)
- `name` (string, optional)
- `age` (number, 18-100, optional)
- `sex` (string, "male"/"female"/"other", optional)
- `bio` (string, max 500 chars, optional)
- `location` (string, optional)
- `moveInDate` (string, ISO date, optional)
- `budget` (number, optional)
- `currency` (string, optional)
- All lifestyle preferences (boolean, optional)

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "username": "newusername",
    "name": "Updated Name",
    "age": 25,
    "sex": "male",
    "bio": "Updated bio",
    "preferences": {
      "location": "Rabat",
      "budget": 6000,
      "currency": "EUR",
      // ... all preferences
    }
  }
}
```

**Error Responses:**

**409 Conflict - Username Taken:**
```json
{
  "statusCode": 409,
  "message": "Username already taken",
  "error": "Conflict"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "statusCode": 400,
  "message": [
    "age must not be less than 18",
    "username must be longer than or equal to 3 characters"
  ],
  "error": "Bad Request"
}
```

**Examples:**

**Update Just Bio:**
```bash
curl -X PATCH http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated my bio!"}'
```

**Update Multiple Fields:**
```bash
curl -X PATCH http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "age": 26,
    "location": "Tangier",
    "budget": 7000
  }'
```

---

### Change Password

Change user's password.

**Endpoint:** `PATCH /password`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Field Requirements:**
- `currentPassword` (string, required) - Current password
- `newPassword` (string, required, min 8 chars) - Must contain uppercase, lowercase, and number

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

**401 Unauthorized - Wrong Current Password:**
```json
{
  "statusCode": 401,
  "message": "Current password is incorrect",
  "error": "Unauthorized"
}
```

**400 Bad Request - Weak Password:**
```json
{
  "statusCode": 400,
  "message": [
    "newPassword must be longer than or equal to 8 characters",
    "Password must contain uppercase, lowercase, and number"
  ],
  "error": "Bad Request"
}
```

**Examples:**

**cURL:**
```bash
curl -X PATCH http://localhost:3002/api/users/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass123"
  }'
```

---

## 📦 Data Models

### User Model
```typescript
{
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  age: number | null;
  sex: 'male' | 'female' | 'other' | null;
  avatar: string;
  bio: string | null;
  googleId: string | null;
  intra42Id: string | null;
  isOnline: boolean;
  isVerified: boolean;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserPreferences Model
```typescript
{
  id: number;
  userId: number;
  location: string | null;
  moveInDate: Date | null;
  budget: number | null;
  currency: string | null;
  smoker: boolean;
  quietHours: boolean;
  earlyBird: boolean;
  nightOwl: boolean;
  petFriendly: boolean;
  cooks: boolean;
  gamer: boolean;
  social: boolean;
  studious: boolean;
  clean: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "statusCode": 400 | 401 | 404 | 409 | 500,
  "message": "Error description" | ["Error 1", "Error 2"],
  "error": "Error Type"
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Validation failed or invalid data |
| `401` | Unauthorized | Missing or invalid JWT token |
| `404` | Not Found | User not found |
| `409` | Conflict | Username already taken |
| `500` | Internal Server Error | Server error |

---

## 📝 Examples

### Complete User Workflow
```javascript
// 1. After signup/login, complete profile
const token = localStorage.getItem('access_token');

const completeResponse = await fetch('http://localhost:3002/api/users/complete-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'johndoe',
    name: 'John Doe',
    age: 24,
    sex: 'male',
    bio: '42 student',
    location: 'Casablanca',
    moveInDate: '2026-04-01',
    budget: 5000,
    currency: 'MAD',
    smoker: false,
    quietHours: true,
    earlyBird: false,
    nightOwl: true,
    petFriendly: true,
    cooks: true,
    gamer: true,
    social: false,
    studious: true,
    clean: true
  })
});

// 2. Get current user profile
const profileResponse = await fetch('http://localhost:3002/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profile = await profileResponse.json();

// 3. Later, update profile
const updateResponse = await fetch('http://localhost:3002/api/users/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Updated bio',
    budget: 6000
  })
});

// 4. Change password
const passwordResponse = await fetch('http://localhost:3002/api/users/password', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: 'OldPass123',
    newPassword: 'NewPass123'
  })
});
```

---

## 🔗 Related Services

- **Auth Service API:** `http://localhost:3004/api/auth`
- **Chat Service API:** `http://localhost:3001/api/chat`
- **Listings Service API:** `http://localhost:3005/api/listings`

---

## 📞 Support

**Swagger UI (Interactive Docs):** http://localhost:3002/api/users/docs

**Service Logs:**
```bash
docker-compose logs user
```

---

**Last Updated:** March 1, 2026  
**Service Version:** 1.0  
**Maintainer:** Backend Team
