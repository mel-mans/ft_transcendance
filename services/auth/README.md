# Auth Service

## Overview
The Auth Service handles user authentication for the ft_transcendence project. It provides secure user registration, login functionality, and JWT token generation for protected route access across all microservices.

## Tech Stack
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator, class-transformer
- **Container**: Docker

---

## Architecture

### Microservice Responsibilities
✅ User registration (signup)  
✅ User authentication (login)  
✅ JWT token generation  
✅ Password hashing and validation  

### What This Service Does NOT Handle
❌ User profile management (handled by User Management Service)  
❌ User updates/deletion (handled by User Management Service)  
❌ Friend system (handled by separate service)  

---

## Project Structure

```
auth/
├── prisma/
│   ├── migrations/           # Database migrations
│   └── schema.prisma         # Database schema definition
├── src/
│   ├── dto/                  # Data Transfer Objects
│   │   ├── signup.dto.ts     # Signup validation
│   │   └── login.dto.ts      # Login validation
│   ├── guards/               # Route protection
│   │   └── jwt-auth.guard.ts # JWT authentication guard
│   ├── strategies/           # Authentication strategies
│   │   └── jwt.strategy.ts   # JWT verification strategy
│   ├── app.controller.ts     # HTTP endpoints
│   ├── app.module.ts         # Module configuration
│   ├── app.service.ts        # Business logic
│   ├── main.ts               # Application entry point
│   └── prisma.service.ts     # Database connection
├── Dockerfile                # Multi-stage Docker build
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables
```

---

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String?  // Optional for OAuth users
  
  // Profile Information
  firstName String?
  lastName  String?
  avatar    String?  @default("default-avatar.png")
  bio       String?
  
  // OAuth Identifiers
  googleId  String?  @unique
  intra42Id String?  @unique
  
  // Account Status
  isOnline   Boolean  @default(false)
  isVerified Boolean  @default(false)
  isActive   Boolean  @default(true)
  lastSeenAt DateTime @default(now())
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## API Endpoints

Base URL: `http://localhost:3004/api/auth`

### Public Endpoints (No Authentication Required)

#### 1. Health Check
```http
GET /api/auth
```

**Response:**
```json
"Hello from Auth Service!"
```

---

#### 2. User Signup
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123",
  "firstName": "John",      // Optional
  "lastName": "Doe"         // Optional
}
```

**Validation Rules:**
- Email: Must be valid email format
- Username: Minimum 3 characters
- Password: Minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Success Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "default-avatar.png",
    "bio": null,
    "isOnline": false,
    "isVerified": false,
    "isActive": true,
    "createdAt": "2026-02-19T01:23:45.678Z",
    "updatedAt": "2026-02-19T01:23:45.678Z"
  }
}
```

**Error Responses:**
```json
// 409 Conflict - Email or username already exists
{
  "statusCode": 409,
  "message": "Email or username already exists"
}

// 400 Bad Request - Validation failed
{
  "statusCode": 400,
  "message": [
    "Password must contain uppercase, lowercase, and number"
  ]
}
```

---

#### 3. User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "default-avatar.png",
    "isOnline": false,
    "createdAt": "2026-02-19T01:23:45.678Z"
  }
}
```

**Error Response:**
```json
// 401 Unauthorized - Invalid credentials
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### Protected Endpoints (Requires JWT Token)

#### 4. Get Current User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "message": "This is a protected route!",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**Error Response:**
```json
// 401 Unauthorized - Missing or invalid token
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Authentication Flow

### 1. Signup Flow
```
Client → POST /auth/signup
         ↓
    Validate input (DTO)
         ↓
    Check if email/username exists
         ↓
    Hash password (bcrypt)
         ↓
    Create user in database
         ↓
    Return user (without password)
```

### 2. Login Flow
```
Client → POST /auth/login
         ↓
    Validate input (DTO)
         ↓
    Find user by email
         ↓
    Compare password (bcrypt.compare)
         ↓
    Generate JWT token
         ↓
    Return token + user info
```

### 3. Protected Route Access Flow
```
Client → GET /protected-route
         Header: Authorization: Bearer <token>
         ↓
    JwtAuthGuard intercepts request
         ↓
    Extract token from header
         ↓
    Verify token signature (JwtStrategy)
         ↓
    Decode payload
         ↓
    Attach user info to request (req.user)
         ↓
    Continue to controller
```

---

## JWT Token Structure

### Token Payload
```json
{
  "sub": 1,                      // User ID
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1708281234,             // Issued at
  "exp": 1708886034              // Expires at (7 days)
}
```

### Token Expiration
- **Default**: 7 days
- **Configurable**: Via `JWT_EXPIRES_IN` in `.env`

---

## Environment Variables

Create a `.env` file in the auth service root:

```env
# Database
DATABASE_URL="postgresql://username:password@postgres:5432/database_name?schema=public"

# Service
AUTH_SERVICE_PORT=3004

# JWT Configuration
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

**⚠️ IMPORTANT:**
- Never commit `.env` to version control
- Use strong, random JWT_SECRET in production
- Keep JWT_SECRET the same across all services

---

## Installation & Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Local Development Setup

1. **Install dependencies:**
```bash
cd services/auth
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Generate Prisma client:**
```bash
npx prisma generate
```

4. **Run database migrations:**
```bash
npx prisma migrate dev
```

5. **Start development server:**
```bash
npm run start:dev
```

---

## Docker Setup

### Build and Run with Docker Compose

```bash
# Build only auth service
docker-compose up --build auth

# Build and run in background
docker-compose up -d --build auth

# View logs
docker-compose logs -f auth

# Stop service
docker-compose stop auth

# Restart service
docker-compose restart auth
```

### Dockerfile Stages

**Stage 1: Builder**
- Installs dependencies
- Generates Prisma client
- Compiles TypeScript to JavaScript

**Stage 2: Production**
- Copies only necessary files (dist, node_modules)
- Runs as non-root user (devops_user)
- Generates Prisma client
- Runs migrations
- Starts the application

---

## Testing

### Manual Testing with cURL

#### Test Signup
```bash
curl -X POST http://localhost:3004/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

#### Test Protected Route
```bash
# First, get token from login response
TOKEN="your-jwt-token-here"

curl http://localhost:3004/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Testing with Postman

1. Import the following collection:
   - Base URL: `http://localhost:3004`
   - Create requests for each endpoint
   - Use environment variables for token storage

2. Test flow:
   - Signup → Save user credentials
   - Login → Save access_token to environment
   - Use token in Authorization header for protected routes

---

## Security Features

### Password Security
- ✅ Passwords hashed using bcrypt (10 salt rounds)
- ✅ Passwords never returned in API responses
- ✅ Strong password requirements enforced

### JWT Security
- ✅ Tokens signed with secret key
- ✅ Tokens expire after 7 days
- ✅ Signature verification on every protected request
- ✅ Payload contains minimal user info (no sensitive data)

### Input Validation
- ✅ All inputs validated using class-validator
- ✅ Whitelist mode (strips unknown properties)
- ✅ Type transformation enabled
- ✅ SQL injection prevention via Prisma ORM

### Database Security
- ✅ Unique constraints on email and username
- ✅ Prepared statements via Prisma (prevents SQL injection)
- ✅ Connection pooling
- ✅ Environment-based configuration

---

## Common Issues & Troubleshooting

### Issue: "Property 'user' does not exist on type 'PrismaService'"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Connection refused" when connecting to database

**Solution:**
- Ensure PostgreSQL container is running
- Check `DATABASE_URL` in `.env`
- Verify network configuration in `docker-compose.yml`

### Issue: "Unauthorized" on protected routes

**Solution:**
- Check token format: `Bearer <token>`
- Verify JWT_SECRET matches across services
- Check token expiration

### Issue: Docker build fails on Prisma generate

**Solution:**
- Ensure OpenSSL is installed in Dockerfile
- Check Prisma schema syntax
- Clear Docker cache: `docker-compose build --no-cache auth`

---

## Future Enhancements

### Planned Features
- [ ] OAuth integration (42 Intra, Google)
- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting
- [ ] Account lockout after failed attempts
- [ ] Session management

---

## Code Duplication Note

⚠️ **Important:** Currently, some code is duplicated between Auth and User Management services:
- `prisma/schema.prisma`
- `jwt.strategy.ts`
- `jwt-auth.guard.ts`

**Reason:** Rapid development and learning phase

**TODO:** Refactor to shared library (Yarn Workspaces or NX) before production

---

## Dependencies

### Production Dependencies
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@prisma/client": "^5.0.0",
  "bcrypt": "^5.1.1",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "reflect-metadata": "^0.1.13",
  "rxjs": "^7.8.1"
}
```

### Development Dependencies
```json
{
  "@types/bcrypt": "^5.0.0",
  "@types/node": "^20.0.0",
  "@types/passport-jwt": "^4.0.0",
  "prisma": "^5.0.0",
  "typescript": "^5.0.0"
}
```

---

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow NestJS conventions
- Use DTOs for all input validation
- Keep controllers thin (delegate to services)
- Use meaningful variable names
- Add comments for complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/auth-feature-name

# Make changes and commit
git add .
git commit -m "feat(auth): add feature description"

# Push and create PR
git push origin feature/auth-feature-name
```

---

## Team

- **Auth Service Owner**: Younes
- **DevOps**: [Teammate Name]
- **Frontend Integration**: [Teammate Name]
- **Project**: ft_transcendence - 42 School

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io/) - Debug JWT tokens
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

---

## License

This project is part of the 42 School curriculum.

---

## Contact

For questions or issues related to the Auth Service, contact the team via:
- Slack: #ft-transcendence-auth
- GitHub Issues: [Repository Link]

---

**Last Updated**: February 19, 2026  
**Version**: 1.0.0  
**Status**: ✅ Active Development