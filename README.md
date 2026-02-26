# Real-Time Chat App — Backend

The WebSocket server powering the real-time chat application. Built with **Node.js**, **TypeScript**, and the **`ws`** library, it handles room-based messaging, user tracking, and connection lifecycle management.

## 🔗 Deployed URL

**`wss://chatappbackend-rpft.onrender.com`**

Frontend live at: **[chatappfrontend-rho-six.vercel.app](https://chatappfrontend-rho-six.vercel.app)**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Architecture](#architecture)
  - [Room-Based Chat (index.ts)](#room-based-chat-indexts)
  - [Broadcast Chat (normalChat.ts)](#broadcast-chat-normalchatts)
- [WebSocket Protocol](#websocket-protocol)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Features

- **Room-Based Messaging** — Users join specific rooms via a room code; messages are isolated per room.
- **Real-Time Broadcasting** — Messages are instantly delivered to all users in the same room.
- **Sender Identification** — The server tags messages with `"me"` or `"them"` so the client knows which side to render.
- **Username Forwarding** — Usernames are passed through with every message for display on the client.
- **Live User Count** — Broadcasts updated user counts when users join or leave a room.
- **Connection Lifecycle** — Handles connect, disconnect, and cleanup automatically.
- **Unauthorized Access Protection** — Rejects chat messages from sockets not present in the target room.
- **Broadcast Mode** — Includes a simpler broadcast chat implementation (`normalChat.ts`) for reference.

---

## Tech Stack

| Component     | Technology                  |
| ------------- | --------------------------- |
| Runtime       | Node.js                     |
| Language      | TypeScript 5                |
| WebSocket     | `ws` ^8.19.0                |
| Module System | ESM (`"type": "module"`)    |
| Build         | `tsc` (TypeScript compiler) |
| Deployment    | Render                      |

---

## Project Structure

```
chatappbackend/
├── src/
│   ├── index.ts          # Main server — room-based chat with user management
│   └── normalChat.ts     # Simple broadcast chat (all connected users receive all messages)
├── dist/                 # Compiled JavaScript output (git-ignored)
├── .gitignore            # Ignores node_modules, dist, .env
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** (or yarn / pnpm)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chatApp/chatappbackend

# Install dependencies
npm install
```

### Running Locally

```bash
# Build TypeScript and start the server
npm run dev
```

This compiles the TypeScript source to `dist/` and starts the WebSocket server on **port 5000**.

You can then connect to it at `ws://localhost:5000`.

> **Tip:** To use the frontend with the local backend, update the WebSocket URL in the frontend's `ChatApp.tsx`:
>
> ```ts
> const socket = new WebSocket("ws://localhost:5000");
> ```

---

## Architecture

### Room-Based Chat (`index.ts`)

This is the main server used in production. It manages multiple chat rooms using an in-memory `Map`.

#### Data Structure

```typescript
type Room = Map<string, WebSocket[]>;
const rooms: Room = new Map<string, WebSocket[]>();
```

Each room ID maps to an array of connected WebSocket clients.

#### Connection Flow

1. **Client connects** → Server sends `"Connection Successful"` after 1 second.
2. **Client sends `join`** → Server adds the socket to the specified room, broadcasts the updated user count to all room members, and sends a confirmation message to the joining user.
3. **Client sends `chat`** → Server verifies the sender is in the room, then broadcasts the message to all room members. The sender receives `sender: "me"`, others receive `sender: "them"` along with the sender's name.
4. **Client disconnects** → Server removes the socket from all rooms, deletes empty rooms, and broadcasts updated user counts to remaining members.

#### Error Handling

- Malformed JSON messages return `"Some Error occurred"`.
- Chat from a socket not in the target room returns `"Unauthorized access"`.
- Chat without joining a room returns `"You need to Join a room first before sending any message"`.

---

### Broadcast Chat (`normalChat.ts`)

A simpler implementation where **all connected clients receive all messages** — no rooms, no isolation. Useful as a reference or starting point.

#### How It Works

- On connect: adds socket to a global array, sends a `welcome` event with the total user count.
- On message: broadcasts the message to **every** connected client after a 1-second delay.
- On disconnect: removes the socket, sends a `bye` event with updated count to all remaining clients.

---

## WebSocket Protocol

### Client → Server

| Event  | Payload                                             | Description      |
| ------ | --------------------------------------------------- | ---------------- |
| `join` | `{ type: "join", payload: { roomId, name } }`       | Join a chat room |
| `chat` | `{ type: "chat", payload: { roomId, chat, name } }` | Send a message   |

### Server → Client

| Event          | Payload                                                        | Description                         |
| -------------- | -------------------------------------------------------------- | ----------------------------------- |
| Connection     | `"Connection Successful"` (plain text)                         | Sent 1s after WebSocket connects    |
| Join confirm   | `"Successfully Joined room <roomId>"` (plain text)             | Confirms room entry                 |
| `update_users` | `{ type: "update_users", count: number }`                      | Updated active user count in a room |
| Chat message   | `{ sender: "me" \| "them", name: string, text: string }`       | A chat message routed within a room |
| Error          | `"Some Error occurred"` / `"Unauthorized access"` (plain text) | Error responses                     |

---

## Deployment

The backend is deployed on **[Render](https://render.com)** as a Web Service.

### Steps to Deploy on Render

1. Push the `chatappbackend` directory to a GitHub repository.
2. Create a new **Web Service** on Render.
3. Connect the GitHub repo and set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Render will assign a URL (e.g., `wss://chatappbackend-rpft.onrender.com`).

> **Note:** Render free-tier services may spin down after inactivity. The first connection after idle may take ~30 seconds.

---

## Available Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Build TypeScript and start the server        |
| `npm run build` | Compile TypeScript to `dist/`                |
| `npm start`     | Run the compiled server from `dist/index.js` |

---

## Environment & Configuration

- **TypeScript** — Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled.
- **Module System** — ESM (`"type": "module"` in package.json, `"module": "nodenext"` in tsconfig).
- **Output** — Compiled JS, source maps, and declaration files emitted to `dist/`.
- **Port** — The server listens on port `5000` (hardcoded in `index.ts`).

---

## License

This project is open source and available under the [ISC License](LICENSE).
