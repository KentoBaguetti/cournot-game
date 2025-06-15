# Cournot Game Server

This is the server component of the Cournot Game application, which handles game rooms, user sessions, and real-time communication via WebSockets.

## Authentication System

The server uses JWT tokens stored in HTTP-only cookies for secure authentication:

- Tokens are not accessible via JavaScript on the client side
- Tokens automatically expire after 1 hour
- User sessions can persist across page refreshes and reconnections

## API Endpoints

### Authentication

- `POST /auth/login` - Log in with a username
  - Request body: `{ "username": "string" }`
  - Response: `{ "success": true, "user": { "userId": "string", "username": "string" } }`
  - Sets an HTTP-only cookie with the JWT token

- `POST /auth/logout` - Log out the current user
  - Response: `{ "success": true }`
  - Clears the authentication cookie

- `GET /auth/me` - Check authentication status and get current user info
  - Response if authenticated: `{ "authenticated": true, "user": { "userId": "string", "username": "string" } }`
  - Response if not authenticated: `{ "authenticated": false }`

## Socket.IO Connection

When connecting to the Socket.IO server, the client should include the auth token from the cookie:

```javascript
// Client-side connection example
const socket = io('http://localhost:3001', {
  withCredentials: true, // Important for cookies
});
```

The server will automatically:
1. Validate the token from the cookie
2. Associate the socket with the user
3. Reconnect the user to their previous game room if applicable

## Game Events

- `game:create` - Create a new game room
- `game:join` - Join an existing game room
- `game:leave` - Leave a game room
- `game:checkRoles` - Check player roles in the current game
- `game:expandSize` - Modify game room capacity

## Persistent User Sessions

The server now maintains user sessions even when sockets disconnect. When a user reconnects:

1. They are automatically identified by their JWT token
2. Their previous game state is restored
3. They are reconnected to their previous game room if it still exists

This ensures a seamless experience even if the user refreshes their browser or temporarily loses connection. 