# Chat App (React Native + Node.js + Socket.IO)


This repo contains two folders:
 - /server : Node.js + Express + Socket.IO backend (MongoDB)
 - /mobile : Expo React Native frontend

## Quick start (development)
1. Start MongoDB locally (or use Atlas).
2. Server:
   - cd server
   - cp .env.example .env (edit MONGO_URI & JWT_SECRET)
   - npm install
   - npm run dev
3. Mobile:
   - cd mobile
   - npm install
   - npm start
   - Run on Android emulator (uses http://10.0.2.2:4000) or update base URL.

## Deliverables included
- JWT-based auth (register, login)
- REST endpoints for users, conversations, messages
- Socket.IO events: message:send, message:new, typing:start/stop, message:read, user:online/offline
- Message persistence in MongoDB
- Typing indicator and online/offline notifications via sockets
- Basic UI for auth, user list, chat with message list and input box

## Note
This is an MVP scaffold meeting the assignment requirements. You can extend:
 - add read/delivery receipts UI,
 - show last message preview on Home,
 - message pagination,
 - file/image attachments,
 - encryption and production hardening.
