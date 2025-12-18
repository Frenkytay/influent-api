# Deploying WebSocket Server to Render (Free Tier)

This guide is for deploying your WebSocket server to **Render.com** using their **Free Plan** (No Credit Card Required).

## Pre-Deployment Checklist

You must have your **Existing Database Credentials** ready:
- [ ] Database Host (e.g., `viaduct.proxy.rlwy.net` or similar)
- [ ] Database User
- [ ] Database Password
- [ ] Database Name

## Step 1: Create Render Service

1.  **Sign Up**: Go to [Render.com](https://render.com/) and sign up with GitHub.
2.  **New Service**: Click **New +** and select **Web Service**.
3.  **Connect Repo**: Select your `influent-backend` repository.
4.  **Configure Service**:
    *   **Name**: `influent-websocket`
    *   **Root Directory**: `websocket-server` (Very Important!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Instance Type**: Select **Free** (It will say "$0/month").

## Step 2: Set Environment Variables

In the Render Dashboard for your new service, scroll down to **Environment Variables** and verify/add these:

| Key | Value to Enter |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Same secret as your main Backend API |
| `FRONTEND_URL` | Your frontend URL (e.g., `https://myapp.vercel.app`) |
| `DB_HOST` | **[Paste your Existing Host]** |
| `DB_NAME` | **[Paste your Existing DB Name]** |
| `DB_USER` | **[Paste your Existing User]** |
| `DB_PASSWORD` | **[Paste your Existing Password]** |
| `DB_PORT` | `3306` (Default) or check your provider |

## Step 3: Deploy & Verify

1.  Click **Create Web Service**.
2.  Wait for the logs to show "Build Successful" and "Deploying...".
3.  Once Live, you will see your URL at the top (e.g., `https://influent-websocket.onrender.com`).
4.  **Test**: Open `https://influent-websocket.onrender.com/health` in your browser. You should see `{"ok":true, ...}`.

## Step 4: Update Frontend

Go to your Frontend code and update the socket connection:

```javascript
// In src/services/socketService.js (or similar)
const SOCKET_URL = "https://influent-websocket.onrender.com"; // Use your new Render URL
```
