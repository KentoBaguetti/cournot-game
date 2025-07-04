# Cournot Game Server

This is the server component of the Cournot Game application, which handles game rooms, user sessions, and real-time communication via WebSockets.

## Authentication System

The server uses JWT tokens stored in HTTP-only cookies for secure authentication:

- Tokens are not accessible via JavaScript on the client side
- Tokens automatically expire after 1 hour
- User sessions can persist across page refreshes and reconnections

When connecting to the Socket.IO server, the client should include the auth token from the cookie:

```javascript
// Client-side connection example
const socket = io("http://localhost:3001", {
  withCredentials: true, // Important for cookies
});
```

The server will automatically:

1. Validate the token from the cookie
2. Associate the socket with the user
3. Reconnect the user to their previous game room if applicable

## Persistent User Sessions

The server maintains user sessions even when sockets disconnect. When a user reconnects:

1. They are automatically identified by their JWT token
2. Their previous game state is restored
3. They are reconnected to their previous game room if it still exists

This ensures a seamless experience even if the user refreshes their browser or temporarily loses connection.
