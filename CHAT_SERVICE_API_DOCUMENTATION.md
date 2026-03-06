# Chat Service API Documentation

This document describes the current API surface of the Chat service in `services/chat`.

## Service Overview

- Service name: `chat`
- Default port: `3001` (from `CHAT_SERVICE_PORT`, fallback `3001`)
- Protocols: HTTP (REST) + WebSocket (Socket.IO)
- Health endpoint root: `/api/chat`

## Authentication

HTTP message endpoints are protected with `AuthGuard('jwt')`.

JWT extraction order:
1. Cookie: `access_token`
2. `Authorization: Bearer <token>` header

JWT secret:
- `JWT_SECRET` env var
- Fallback: `your-secret-key`

Validated JWT payload is mapped to:
- `userId`
- `email`

## CORS

Configured with credentials enabled.

Allowed origins:
- `https://localhost`
- `https://localhost:443`
- `http://localhost`
- `http://localhost:3003`
- `FRONTEND_URL` (if defined)

Allowed methods:
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

Allowed headers:
- `Content-Type`, `Authorization`

## Data Model (Message)

Based on Prisma `Message` model:

```json
{
  "id": 1,
  "content": "Hello",
  "isRead": false,
  "senderId": 10,
  "receiverId": 22,
  "createdAt": "2026-03-06T12:00:00.000Z",
  "updatedAt": "2026-03-06T12:00:00.000Z"
}
```

## REST Endpoints

## 1) Health Check

- Method: `GET`
- Path: `/api/chat`
- Auth: none

Response body is returned by `AppService.getHealthCheck()`.

Example:

```bash
curl http://localhost:3001/api/chat
```

## 2) Get Conversation Messages

- Method: `GET`
- Path: `/api/chat/messages/:userId`
- Path param:
  - `userId` (integer): the other participant's user ID
- Auth: required (JWT)

Behavior:
- Returns all messages between authenticated user and `userId`
- Ordered by `createdAt` ascending

Example:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/chat/messages/22
```

Success response (`200`):

```json
[
  {
    "id": 14,
    "content": "Hey, is the room still available?",
    "isRead": false,
    "senderId": 10,
    "receiverId": 22,
    "createdAt": "2026-03-06T12:01:00.000Z",
    "updatedAt": "2026-03-06T12:01:00.000Z"
  }
]
```

## 3) Send Message (HTTP)

- Method: `POST`
- Path: `/api/chat/messages/:userId`
- Path param:
  - `userId` (integer): receiver user ID
- Body:

```json
{
  "content": "Hello from HTTP"
}
```

- Auth: required (JWT)

Behavior:
- Creates a new message with:
  - `senderId` = authenticated user ID
  - `receiverId` = `:userId`
  - `content` = request body `content`

Example:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello from HTTP"}' \
  http://localhost:3001/api/chat/messages/22
```

Success response (`201`):

```json
{
  "id": 15,
  "content": "Hello from HTTP",
  "isRead": false,
  "senderId": 10,
  "receiverId": 22,
  "createdAt": "2026-03-06T12:02:00.000Z",
  "updatedAt": "2026-03-06T12:02:00.000Z"
}
```

## WebSocket API (Socket.IO)

- Namespace: `/chat`
- CORS: `origin: *` (gateway-level)

Client connection example:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3001/chat");
```

## Event: `joinRoom`

Join a deterministic 1:1 room.

Client emits:

```json
{
  "userId": 10,
  "otherUserId": 22
}
```

Room naming algorithm:
- Sort the two IDs ascending
- Room name: `room_<smallerId>_<largerId>`
- Example: `room_10_22`

## Event: `sendMessage`

Create and broadcast a message.

Client emits:

```json
{
  "senderId": 10,
  "receiverId": 22,
  "content": "Hello via socket"
}
```

Server behavior:
- Persists message to DB
- Emits `newMessage` to the corresponding room
- Returns the created message as acknowledgement

## Event: `newMessage`

Server broadcasts newly created message payload to all clients in room.

Payload shape is the same as Prisma `Message` object.

## Error Behavior

Common HTTP errors:
- `401 Unauthorized`: missing/invalid JWT
- `400 Bad Request`: invalid `userId` path param (not an integer)

Validation for body fields (like empty `content`) is currently minimal in code and not enforced with DTO/class-validator.

## Environment Variables

- `CHAT_SERVICE_PORT`: HTTP port for chat service
- `JWT_SECRET`: JWT verification secret
- `FRONTEND_URL`: optional extra CORS origin

## Implementation Notes

- `MessagesController` currently has both `@Controller('api/chat/messages')` and `@Controller('messages')` decorators. The intended API path used by project conventions is `/api/chat/messages`.
- Controller methods read authenticated user from `req.user.id`, while JWT strategy currently maps payload to `userId` and `email`. Ensure your JWT payload mapping and controller access pattern are aligned in runtime.
