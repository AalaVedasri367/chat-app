# Chat Mobile (Expo React Native)
## Setup
1. Install dependencies: `cd mobile && npm install`
2. Start: `npm start` then run on emulator or device.
3. Note: Axios endpoints assume server at http://10.0.2.2:4000 for Android emulator.
   - If testing on a real device, replace base URLs with your machine IP: e.g. http://192.168.1.100:4000
## Features
- Register / Login (stores JWT in AsyncStorage)
- User list (tap to start 1:1 conversation)
- Chat screen with real-time messages via Socket.IO
- Typing indicator
