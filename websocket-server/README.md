# Influent WebSocket Server

Real-time WebSocket server for Influent chat application using Socket.IO.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment:**

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
```

3. **Start server:**

```bash
npm start
```

Server runs on `http://localhost:4000`

---

## 🌐 Deploy to Railway (Free)

### Option 1: Railway CLI

1. **Install Railway CLI:**

```bash
npm install -g @railway/cli
```

2. **Login:**

```bash
railway login
```

3. **Initialize & Deploy:**

```bash
railway init
railway up
```

4. **Add environment variables:**

```bash
railway variables set JWT_SECRET=your_secret_here
railway variables set DB_HOST=your_db_host
railway variables set DB_NAME=influent_db
railway variables set DB_USER=your_user
railway variables set DB_PASSWORD=your_password
railway variables set FRONTEND_URL=https://your-frontend.com
```

### Option 2: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Set root directory to `websocket-server/`
5. Add environment variables in dashboard
6. Deploy!

---

## 🔧 Deploy to Render (Free)

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Name:** influent-websocket
   - **Root Directory:** `websocket-server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables
6. Click "Create Web Service"

**Note:** Free tier sleeps after 15 min inactivity (takes ~30sec to wake up).

---

## 🔧 Deploy to Fly.io (Free)

1. **Install Fly CLI:**

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

2. **Login:**

```bash
flyctl auth login
```

3. **Launch app:**

```bash
cd websocket-server
flyctl launch
```

4. **Set secrets:**

```bash
flyctl secrets set JWT_SECRET=your_secret
flyctl secrets set DB_HOST=your_host
flyctl secrets set DB_NAME=influent_db
flyctl secrets set DB_USER=your_user
flyctl secrets set DB_PASSWORD=your_password
flyctl secrets set FRONTEND_URL=https://your-frontend.com
```

5. **Deploy:**

```bash
flyctl deploy
```

---

## 📡 Frontend Integration

### Connect from React/Next.js:

```javascript
import { io } from "socket.io-client";

// Replace with your deployed WebSocket server URL
const SOCKET_URL = "https://your-app.railway.app";

const socket = io(SOCKET_URL, {
  auth: {
    token: yourJwtToken, // JWT from your API login
  },
});

// Join a chat room
socket.emit("joinRoom", { roomId: 123 });

// Listen for messages
socket.on("message", (message) => {
  console.log("New message:", message);
});

// Send a message
socket.emit("message", {
  roomId: 123,
  message: "Hello!",
});

// Typing indicator
socket.emit("typing", { roomId: 123, typing: true });
```

---

## 🔑 Environment Variables

| Variable       | Description                          | Required |
| -------------- | ------------------------------------ | -------- |
| `PORT`         | Server port (default: 4000)          | No       |
| `JWT_SECRET`   | JWT secret (must match main API)     | **Yes**  |
| `DB_HOST`      | Database host                        | **Yes**  |
| `DB_PORT`      | Database port (default: 3306)        | No       |
| `DB_NAME`      | Database name                        | **Yes**  |
| `DB_USER`      | Database user                        | **Yes**  |
| `DB_PASSWORD`  | Database password                    | **Yes**  |
| `DB_DIALECT`   | Database type (default: mysql)       | No       |
| `FRONTEND_URL` | Frontend URL for CORS                | **Yes**  |
| `NODE_ENV`     | Environment (production/development) | No       |

---

## 📋 API Endpoints

### HTTP Endpoints

- **GET /** - Server info
- **GET /health** - Health check

### WebSocket Events

#### Client → Server

- `joinRoom` - Join a chat room

  ```js
  {
    roomId: number;
  }
  ```

- `leaveRoom` - Leave a chat room

  ```js
  {
    roomId: number;
  }
  ```

- `message` - Send a message

  ```js
  { roomId: number, message: string }
  ```

- `typing` - Send typing indicator

  ```js
  { roomId: number, typing: boolean }
  ```

- `markAsRead` - Mark messages as read
  ```js
  { roomId?: number, messageId?: number }
  ```

#### Server → Client

- `history` - Previous messages (on join)
- `message` - New message
- `typing` - User typing status
- `userJoined` - User joined room
- `userLeft` - User left room
- `error` - Error message
- `markedAsRead` - Read confirmation

---

## 🧪 Testing

Test the server is running:

```bash
# Health check
curl http://localhost:4000/health

# Should return:
# {"ok":true,"timestamp":"...","service":"influent-websocket-server"}
```

Test WebSocket connection (using wscat):

```bash
npm install -g wscat
wscat -c ws://localhost:4000
```

---

## 📊 Architecture

```
Frontend (React/Next.js)
    ├─→ REST API (Vercel): https://api.vercel.app/api/...
    └─→ WebSocket (Railway): wss://chat.railway.app

WebSocket Server (Railway/Render/Fly.io)
    └─→ MySQL Database (shared with REST API)
```

---

## 🛠️ Troubleshooting

### Connection refused

- Check firewall/port settings
- Ensure PORT environment variable is set
- Verify database connection

### Authentication failed

- Ensure JWT_SECRET matches your main API
- Check token format in client

### Messages not delivering

- Verify user is participant of room
- Check database ChatRoomParticipant table
- Check server logs for errors

---

## 📝 Notes

- Uses the **same database** as your main REST API
- JWT tokens are validated on connection
- Rooms are auto-created via main API
- Messages are persisted to database
- Supports typing indicators & read receipts

---

## 🔗 Useful Links

- [Socket.IO Docs](https://socket.io/docs/v4/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)
