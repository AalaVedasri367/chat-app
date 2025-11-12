# Chat Server (Node.js + Express + Socket.IO)
## Setup
1. Install dependencies: `cd server && npm install`
2. Create `.env` based on `.env.example`.
3. Start server: `npm run dev` (requires nodemon) or `npm start`.
4. Default port: 4000
## Notes
- Uses MongoDB (change MONGO_URI in .env).
- Socket.IO authentication is done via JWT sent in socket.handshake.auth.token
- REST endpoints:
  - POST /auth/register {name,email,password}
  - POST /auth/login {email,password}
  - GET /users (requires Authorization Bearer token)
  - POST /conversations {participantId} (requires token)
  - GET /conversations/:id/messages (requires token)
- Socket events:
  - message:send -> server saves and emits message:new to both sender and receiver
  - typing:start, typing:stop
  - message:read
