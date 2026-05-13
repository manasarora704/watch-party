# Watchio — Watch Together. Feel Together.

A real-time YouTube watch party platform that allows multiple users to watch and control YouTube videos together with synchronized playback, role-based access control, and live chat.

## Live Deployment

**[Live URL to be added after deployment]** (Deploy to Render, Railway, or Vercel)

## Project Overview

Watchio is a full-stack watch party system built with modern technologies to enable seamless, real-time video synchronization across multiple participants. Users can create rooms, join via unique codes, control playback (with role-based restrictions), and chat in real-time.

### Key Features

- **Real-time Synchronization** – Play/pause, seek, and video changes sync instantly across all participants
- **Room-Based Model** – Create private watch rooms with unique codes
- **YouTube Integration** – Embedded YouTube player with full API control
- **Role-Based Access Control (RBAC)** – Host, Moderator, and Participant roles with granular permissions
- **Live Chat** – Real-time text chat with emoji and GIF support
- **Session Persistence** – Auto-reconnect when switching tabs or recovering from connection loss
- **Rich UI** – Beautiful, responsive interface with participant management and role visualization

## Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript (strict mode)
- **Routing:** TanStack Router (file-based routing)
- **State Management:** Zustand (watchio.ts store)
- **Styling:** Tailwind CSS + Framer Motion
- **Real-time:** Socket.io-client with auto-reconnection
- **Icons:** lucide-react
- **Build Tool:** Vite
- **UI Components:** shadcn/ui (pre-built accessible components)

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express + Socket.io
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** Prisma with migrations
- **Validation:** Zod schemas
- **Architecture:** OOP-based with Room, Participant, and Service classes

### Infrastructure
- **Development:** Docker Compose (PostgreSQL)
- **Real-time Communication:** Socket.io (WebSockets with fallback to polling)
- **Deployment:** Render, Railway, or Vercel + separate backend

## Architecture Overview

### WebSocket Event Flow

```
Client (Browser)
    ↓
Socket.io Connection (ws or http polling)
    ↓
Express Server (Port 4000)
    ↓
RoomManager (In-memory room state)
    ↓
Socket Event Handlers (play, pause, seek, assign_role, etc.)
    ↓
PermissionService (RBAC validation)
    ↓
Broadcast to all clients in room via Socket.io
    ↓
Zustand Store updates
    ↓
UI re-renders
```

### Role-Based Access Control (RBAC)

| Role | Can Control | Can Manage |
|------|-------------|-----------|
| **Host** | Play, Pause, Seek, Change Video | Assign Roles (Moderator/Participant only), Remove Participants |
| **Moderator** | Play, Pause, Seek, Change Video | None |
| **Participant** | Watch Only | None |

**Key Security Feature:** Hosts can ONLY assign Moderator or Participant roles—they CANNOT assign the Host role to anyone, preventing privilege escalation.

### Core Components

#### Frontend
- **Rooms.tsx** – Room creation/joining with comprehensive validation
- **WatchRoom.tsx** – Main room interface with video player, chat, and participants
- **EnhancedParticipantsPanel.tsx** – Participant list with role management
- **EnhancedChatInput.tsx** – Chat input with emoji/GIF support
- **EnhancedChatMessage.tsx** – Message rendering with reactions

#### Backend
- **Room.ts** – Room state management (participants, playback, messages)
- **RoomManager.ts** – Multi-room management
- **PermissionService.ts** – RBAC enforcement
- **roleHandlers.ts** – Socket event handlers for role operations
- **Prisma Schema** – Database models for persistence

#### Session Management
- **session-persistence.ts** – localStorage-based session management (24-hour TTL)
- **visibilityManager** – Page visibility detection for tab switching
- **Auto-reconnection** – Socket.io with exponential backoff (1s→5s, max 10 attempts)

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Docker Desktop (for PostgreSQL)
- YouTube API (embedded player, no API key needed)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/watchio.git
cd watchio
```

### 2. Install Dependencies

```bash
npm install
cd watch-party-prime && npm install
cd ../watch-party-prime/server && npm install
cd ../../
```

### 3. Database Setup

Ensure Docker Desktop is running, then:

```bash
docker-compose up -d
cd watch-party-prime/server
npx prisma migrate dev --name init
cd ../..
```

### 4. Environment Configuration

Create `.env` in `watch-party-prime/`:

```env
VITE_SOCKET_URL=http://localhost:4000
```

Create `.env` in `watch-party-prime/server/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/watchio?schema=public
NODE_ENV=development
PORT=4000
```

### 5. Run Development Servers

**Terminal 1: Frontend**
```bash
cd watch-party-prime
npm run dev
```
→ Accessible at `http://localhost:5173`

**Terminal 2: Backend**
```bash
cd watch-party-prime/server
npm run dev
```
→ Listening at `http://localhost:4000`

## API & WebSocket Events

### Client → Server Events

| Event | Payload | Permission | Description |
|-------|---------|-----------|-------------|
| `join_room` | `{ roomId, username, createIfMissing }` | Public | Join or create a room |
| `play` | `{ roomId, currentTime }` | Host/Moderator | Start playback |
| `pause` | `{ roomId, currentTime }` | Host/Moderator | Pause playback |
| `seek` | `{ roomId, currentTime }` | Host/Moderator | Seek to position |
| `change_video` | `{ roomId, videoId, videoTitle }` | Host/Moderator | Change video |
| `assign_role` | `{ roomId, participantId, role }` | Host only | Assign role (Moderator or Participant) |
| `remove_participant` | `{ roomId, participantId }` | Host only | Remove participant |
| `send_message` | `{ roomId, text, emoji }` | All | Send chat message |
| `leave_room` | `{ roomId, participantId }` | Public | Leave room |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `sync_state` | Room snapshot | Full room state (playback, participants, messages) |
| `play` | `{ currentTime }` | Broadcast play to room |
| `pause` | `{ currentTime }` | Broadcast pause to room |
| `seek` | `{ currentTime }` | Broadcast seek to room |
| `change_video` | `{ videoId, videoTitle }` | New video broadcast |
| `user_joined` | `{ participantId, username, role }` | New participant joined |
| `user_left` | `{ participantId }` | Participant left |
| `role_assigned` | `{ participantId, role }` | Role updated |
| `participant_removed` | `{ participantId }` | Participant removed by host |
| `chat_message` | Message object | New chat message |
| `error_message` | `{ code, message }` | Error notification |

## Deployment Guide

### Option 1: Render (Full-Stack) - RECOMMENDED

**Best for:** Complete setup with WebSocket support

#### Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create PostgreSQL Database on Render**
   - Go to [render.com](https://render.com)
   - Dashboard → New PostgreSQL
   - Name: watchio-db
   - Region: closest to target users
   - Copy the connection URL

3. **Create Web Service for Backend**
   - New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Name:** watchio-backend
     - **Region:** Same as database
     - **Runtime:** Node
     - **Build Command:** 
       ```bash
       cd watch-party-prime/server && npm install && npx prisma migrate deploy
       ```
     - **Start Command:** 
       ```bash
       cd watch-party-prime/server && npm run build && npm start
       ```
     - **Environment Variables:**
       ```
       DATABASE_URL=postgresql://[user]:[pass]@[host]/watchio
       NODE_ENV=production
       PORT=4000
       ```
   - Click Deploy

4. **Get Backend URL**
   - After deployment, Render shows URL like: `https://watchio-backend.onrender.com`
   - Save this for frontend configuration

#### Frontend Deployment (Vercel)

1. **Create Vercel Account and Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Sign up and connect GitHub account

2. **Import Repository**
   - Import project
   - Select your watchio repository

3. **Configure Build Settings**
   - **Framework:** Vite
   - **Root Directory:** `watch-party-prime`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables**
   ```
   VITE_SOCKET_URL=https://watchio-backend.onrender.com
   ```
   (Replace with your actual Render backend URL)

5. **Deploy**
   - Click Deploy
   - Frontend will be available at: `https://your-project.vercel.app`

#### Verify Deployment

```bash
curl https://your-project.vercel.app
curl https://watchio-backend.onrender.com/health
```

---

### Option 2: Railway

**Best for:** Simplicity and integrated database

#### Steps:

1. **Create Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Add PostgreSQL plugin
   - Add GitHub repository as service

2. **Configure Backend Service**
   - Set root directory: `watch-party-prime/server`
   - Build command: `npm install && npx prisma migrate deploy`
   - Start command: `npm run build && npm start`

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   PORT=4000
   ```

4. **Deploy Frontend to Vercel**
   - Follow Option 1 step 1-5
   - Set `VITE_SOCKET_URL` to Railway backend URL

---

### Option 3: Docker Compose (Local Development)

```bash
docker-compose up -d
npm run dev  # Terminal 1: Frontend
npm run dev  # Terminal 2: Backend
```

Access at `http://localhost:5173`

---

## Database Migrations

### Local Development
```bash
cd watch-party-prime/server

npx prisma migrate dev --name add_feature
npx prisma db push
npx prisma studio  # View/edit data
```

### Production (Render/Railway)
```bash
npx prisma migrate deploy
```

---

## Performance & Scaling

### Frontend Optimization
- Lazy route loading with TanStack Router
- Memoized components to prevent re-renders
- Socket.io connection pooling
- 24-hour session persistence (localStorage)

### Backend Optimization
- In-memory room state (no DB queries during playback)
- Binary WebSocket frames (Socket.io)
- Database connection pooling
- Exponential backoff for reconnection

### Scale to 100+ Users
- **Redis Adapter:** Add Socket.io Redis adapter for multi-server broadcast
  ```bash
  npm install @socket.io/redis-adapter redis
  ```
- **Load Balancer:** Use Render/Railway built-in load balancing
- **CDN:** Serve static assets from CDN (Vercel handles this)
- **Database:** Upgrade to managed PostgreSQL (Render/Railway)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection refused** | Check backend URL in VITE_SOCKET_URL matches deployed backend |
| **WebSocket timeout** | Verify WebSocket support enabled in browser (no old proxies) |
| **Database connection error** | Confirm DATABASE_URL is correct, run `npx prisma db push` |
| **Role changes not syncing** | Check PermissionService.ts, verify host has permission |
| **Session lost on refresh** | Ensure localStorage is enabled, check 24-hour TTL |
| **Chat not appearing** | Verify Socket.io connection status in browser console |

---

## Production Checklist

- [ ] Set `NODE_ENV=production` on backend
- [ ] Enable HTTPS (Render/Railway auto-enable)
- [ ] Run `npx prisma migrate deploy` before first deployment
- [ ] Set strong `DATABASE_URL` with secure credentials
- [ ] Update `VITE_SOCKET_URL` to production backend URL
- [ ] Test room creation, joining, playback sync, chat, RBAC
- [ ] Monitor backend logs for errors (Render console)
- [ ] Set up Sentry/LogRocket for error tracking (optional)

---

## Testing

### Manual Test Flow

1. **Create Room as Host**
   - Go to https://your-app.vercel.app
   - Enter name, room title
   - Copy room code

2. **Join as Guest**
   - Open in another tab/browser
   - Enter room code and name
   - Verify you see Host in participants

3. **Test Playback Sync**
   - Host: Play video → Guest sees play
   - Host: Seek to 1:30 → Guest auto-seeks
   - Host: Pause → Guest sees pause

4. **Test RBAC**
   - Host: Right-click participant → Change Role dropdown
   - Verify only "Moderator" and "Viewer" options available
   - Try to change yourself (button disabled)
   - Assign Guest as Moderator → Guest can now play/pause

5. **Test Chat**
   - Send message with emoji → Verify delivery
   - Send GIF request → Verify GIF renders
   - Verify role badges show correctly

---

## Code Understanding

### Key Technologies

**Socket.io**
- Real-time bidirectional communication
- Auto-reconnection with exponential backoff
- Event-driven architecture
- Broadcasting to room groups

**Zustand Store**
- Client-side state management
- Simple API, no boilerplate
- Session persistence to localStorage

**Prisma ORM**
- Type-safe database queries
- Auto-migrations
- PostgreSQL support

**Express + TypeScript**
- Backend API and WebSocket server
- Middleware pattern for validation
- OOP structure with classes

### RBAC Security

**Backend Validation:**
```typescript
if (!permissions.canAssignRole(myRole, targetRole)) {
  emitSocketError(socket, "UNAUTHORIZED");
  return;
}
```

**Frontend Restriction:**
- Role dropdown shows only Moderator/Participant (not Host)
- Change role button hidden for host participants
- UI disabled for non-hosts

**Defense in Depth:**
- Frontend UI hides restricted actions
- Backend validates every operation
- Host role cannot be assigned (prevents privilege escalation)

---

## Future Enhancements

- [ ] User authentication & profiles
- [ ] Persistent room history
- [ ] Advanced reactions (emoji animations)
- [ ] Message threading & replies
- [ ] Typing indicators
- [ ] Screen sharing (WebRTC)
- [ ] Mobile app (React Native)
- [ ] Video recommendations
- [ ] Analytics dashboard

---

## Support & Contributing

For issues or questions:
- GitHub Issues: [Create issue](https://github.com/yourusername/watchio/issues)
- Email: support@watchio.com

---

**Built with ❤️ using React, Node.js, Socket.io, and Tailwind CSS**

### Technology Stack

**Frontend:**
- React 19 + TypeScript
- TanStack Start with file-based routing (TanStack Router)
- Tailwind CSS v4 with custom color palette
- Framer Motion for animations
- Socket.IO Client for real-time communication
- Zustand for client-side state management
- Lucide React for icons
- Vite for build tooling

**Backend:**
- Node.js with Express HTTP server
- Socket.IO for WebSocket communication
- Prisma ORM v6.13.0 for database abstraction
- SQLite for persistence (file: `./dev.db`)
- Zod for runtime validation of socket payloads
- TypeScript for type safety

### Real-Time Communication Flow

```
Client Application
    ↓ (emit)
Socket.IO Client
    ↓ (WebSocket)
Server Socket.IO
    ↓
Room Manager + Participant Tracker
    ↓ (validate permissions)
Permission Service
    ↓ (execute action)
Broadcast Event
    ↓ (emit back)
All Connected Clients Update State
    ↓
Zustand Store hydrates
    ↓
React components re-render
```

### Socket.IO Event Contract

**Client → Server:**
- `join_room` - { roomId, username } - Join a room
- `leave_room` - { } - Leave the current room
- `play` - { } - Play video (Host/Moderator only)
- `pause` - { } - Pause video (Host/Moderator only)
- `seek` - { time } - Seek to position (Host/Moderator only)
- `change_video` - { videoId, videoTitle } - Change video (Host/Moderator only)
- `assign_role` - { userId, role } - Assign role (Host only)
- `remove_participant` - { userId } - Remove user (Host only)
- `send_message` - { text, emoji } - Send chat message
- `tick` - { } - Periodic sync pulse (every 100ms)

**Server → Client:**
- `sync_state` - { playState, currentTime, videoId, videoTitle, duration, participants, messages } - Full room state
- `user_joined` - { userId, username, role, participants } - New user joined
- `user_left` - { userId, participants } - User left
- `role_assigned` - { userId, username, role, participants } - Role change broadcast
- `participant_removed` - { userId, participants } - User removed by host
- `chat_message` - { id, authorId, authorName, text, emoji, role, ts } - New chat message
- `error_message` - { code, message } - Error notification

### Room Model

**Room Entity:**
- `id` - 6-character alphanumeric code (e.g., "A1B2C3")
- `name` - Room display name (e.g., "Friday Night Cinema")
- `participants` - Map of connected Participant entities
- `playback` - { isPlaying, currentTime, videoId, videoTitle, duration, lastSyncTime }
- `messages` - Array of ChatMessage entities (persisted in DB)
- `createdAt` - Room creation timestamp
- `updatedAt` - Last activity timestamp

**Participant Entity:**
- `id` - Unique identifier (socket ID initially, user ID if authenticated)
- `name` - Display name
- `role` - "host" | "moderator" | "participant"
- `socket` - Socket.IO socket instance for message delivery
- `online` - Connection status
- `color` - Avatar background color

### State Management (Client)

**Zustand Store (`src/store/watchio.ts`):**
```typescript
{
  username: string
  myRole: Role
  roomId: string
  roomTitle: string
  videoTitle: string
  videoId: string
  isPlaying: boolean
  currentTime: number
  duration: number
  syncStatus: "synced" | "syncing" | "offline"
  participants: Participant[]
  messages: ChatMessage[]
  
  // Actions
  createRoom: (title, username) => roomId
  joinRoom: (roomId, username) => void
  leaveRoom: () => void
  togglePlay: () => void
  seek: (time) => void
  sendMessage: (text, emoji) => void
  setRole: (userId, role) => void
  changeVideo: (videoId, title) => void
  removeParticipant: (userId) => void
}
```

### Database Schema

**Room Table:**
- id (PRIMARY KEY)
- name
- createdAt
- updatedAt

**Participant Table:**
- id (PRIMARY KEY)
- roomId (FOREIGN KEY)
- name
- role ("host" | "moderator" | "participant")
- onlineStatus
- joinedAt

**ChatMessage Table:**
- id (PRIMARY KEY)
- roomId (FOREIGN KEY)
- authorId
- authorName
- text
- emoji (optional)
- role
- createdAt

## Installation & Setup

### Prerequisites
- **Node.js** 18.0+ 
- **npm** 9.0+
- Modern web browser with YouTube IFrame API support

### Local Development

1. **Clone the repository:**
```bash
git clone <repo-url>
cd watch-party-prime
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**

Create `.env.local` in the project root:
```env
# Socket.IO server URL (local development)
VITE_SOCKET_URL=http://localhost:4000

# Optional: YouTube API key (if implementing server-side video validation)
YOUTUBE_API_KEY=<your-api-key>
```

4. **Start the development server:**

In one terminal, start the backend:
```bash
npm run dev:server
```

In another terminal, start the frontend:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Project Structure

```
watch-party-prime/
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn/ui components
│   │   └── watchio/               # Watchio-specific components
│   │       ├── Landing.tsx        # Marketing landing page
│   │       ├── Navbar.tsx         # Fixed navigation header
│   │       ├── Rooms.tsx          # Create/join room page
│   │       ├── WatchRoom.tsx      # Main watch party interface
│   │       ├── YouTubeStage.tsx   # YouTube player component
│   │       ├── RoleBadge.tsx      # Role indicator component
│   │       ├── AmbientBackground.tsx  # Animated background
│   │       └── GlassCard.tsx      # Reusable card component
│   ├── hooks/
│   │   └── use-mobile.tsx         # Mobile detection hook
│   ├── lib/
│   │   ├── youtube.ts             # YouTube URL utilities
│   │   ├── utils.ts               # General utilities
│   │   └── error-*.ts             # Error handling
│   ├── routes/
│   │   ├── __root.tsx             # Root layout
│   │   ├── index.tsx              # Landing page route
│   │   ├── rooms.tsx              # Rooms page route
│   │   └── room.$roomId.tsx       # Watch room route (dynamic)
│   ├── socket/
│   │   └── client.ts              # Socket.IO client singleton
│   ├── store/
│   │   └── watchio.ts             # Zustand state store
│   ├── types/
│   │   └── watchio.ts             # TypeScript type definitions
│   ├── router.tsx                 # TanStack Router configuration
│   ├── server.ts                  # Express server entry
│   ├── start.ts                   # Dev server entry
│   └── styles.css                 # Global styles
├── server/                        # Backend server directory
│   ├── src/
│   │   ├── socket/
│   │   │   └── registerSocket.ts  # Socket.IO event handlers
│   │   ├── rooms/
│   │   │   ├── Room.ts           # Room entity class
│   │   │   ├── Participant.ts    # Participant entity class
│   │   │   └── RoomManager.ts    # Room CRUD manager
│   │   ├── services/
│   │   │   ├── PermissionService.ts  # Role-based permission checks
│   │   │   ├── ChatService.ts        # Chat message persistence
│   │   │   └── PersistenceService.ts # Database operations
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database schema
│   │   └── index.ts              # Server entry point
│   └── package.json
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── components.json                # Shadcn/ui configuration
└── wrangler.jsonc                 # Cloudflare Workers config (optional)
```

## Running the Application

### Development Mode

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
npm run dev:server
```

### Production Build

```bash
npm run build
```

This generates optimized bundles in `dist/` for frontend and `dist/server/` for backend.

### Linting & Type Checking

```bash
# Run ESLint and Prettier formatting checks
npm run lint

# Auto-fix formatting issues
npm run lint -- --fix
```

## Deployment

### Option 1: Render (Recommended)

Render supports full-stack Node.js applications with WebSocket servers.

**Steps:**

1. **Create Render account:** https://render.com

2. **Connect GitHub repository:**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repo

3. **Configure Web Service:**
   - **Name:** `watchio` (or your preference)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/server/index.js`
   - **Instance Type:** Starter (free) or Standard

4. **Set Environment Variables:**
   - In Render Dashboard, go to Service Settings
   - Add environment variable:
     ```
     VITE_SOCKET_URL=https://your-app.onrender.com
     NODE_ENV=production
     PORT=3000
     ```

5. **Deploy:**
   - Push code to `main` branch
   - Render automatically builds and deploys

6. **Access your app:**
   ```
   https://watchio.onrender.com (or your custom domain)
   ```

### Option 2: Railway

1. **Create Railway account:** https://railway.app

2. **Connect GitHub:**
   - New Project → Import from GitHub
   - Select repository

3. **Add Environment Variables:**
   - Go to Variables tab
   - Set `VITE_SOCKET_URL`, `NODE_ENV`, `PORT`

4. **Deploy:**
   - Railway auto-deploys on push to main

### Option 3: Vercel (Frontend) + Railway/Render (Backend)

If you prefer to separate frontend and backend:

**Frontend on Vercel:**
```bash
npm install -g vercel
vercel
```

**Backend on Railway/Render with separate `VITE_SOCKET_URL`:**
```env
VITE_SOCKET_URL=https://your-backend.railway.app
```

## Environment Variables

### Frontend (`.env.local`):
```env
# Socket.IO server URL
VITE_SOCKET_URL=http://localhost:4000  # Development
VITE_SOCKET_URL=https://watchio.onrender.com  # Production
```

### Backend (`.env` or Render/Railway dashboard):
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./dev.db  # SQLite (can be overridden for PostgreSQL)
SOCKET_URL=https://watchio.onrender.com
```

## API & WebSocket Reference

### HTTP Endpoints

**GET `/`** - Serve frontend HTML
**GET `/socket.io/*`** - Socket.IO upgrade endpoint

### Socket.IO Events (Detailed)

#### Join a Room
```typescript
// Client emits
socket.emit("join_room", { roomId: "A1B2C3", username: "Alice" });

// Server broadcasts to room
socket.on("sync_state", {
  playState: { isPlaying: false, currentTime: 0, videoId: "dQw4w9WgXcQ" },
  participants: [
    { id: "socket-1", name: "Alice", role: "host", online: true, color: "#8B5CF6" }
  ],
  messages: [],
  syncStatus: "synced"
});

socket.on("user_joined", {
  userId: "socket-1",
  username: "Alice",
  role: "host",
  participants: [...]
});
```

#### Play/Pause Video
```typescript
// Host presses play
socket.emit("play");

// Server validates permission, broadcasts
socket.on("sync_state", { 
  playState: { isPlaying: true, ... } 
});
```

#### Seek to Position
```typescript
// Moderator scrubs to 30 seconds
socket.emit("seek", { time: 30 });

// Server broadcasts new state
socket.on("sync_state", { 
  playState: { currentTime: 30, ... } 
});
```

#### Change Video
```typescript
// Host changes video
socket.emit("change_video", { 
  videoId: "jNQXAC9IVRw", 
  videoTitle: "Me at the zoo" 
});

// Server broadcasts
socket.on("sync_state", { 
  playState: { videoId: "jNQXAC9IVRw", videoTitle: "Me at the zoo", ... } 
});
```

#### Assign Role
```typescript
// Host promotes participant to moderator
socket.emit("assign_role", { userId: "socket-2", role: "moderator" });

// Server broadcasts
socket.on("role_assigned", {
  userId: "socket-2",
  username: "Bob",
  role: "moderator",
  participants: [...]
});
```

#### Send Chat Message
```typescript
socket.emit("send_message", { 
  text: "This scene is amazing!", 
  emoji: "🔥" 
});

socket.on("chat_message", {
  id: "msg-123",
  authorId: "socket-1",
  authorName: "Alice",
  text: "This scene is amazing!",
  emoji: "🔥",
  role: "host",
  ts: 1683950400000
});
```

## Code Walkthrough

### 1. Frontend State Management (Zustand Store)

**File:** `src/store/watchio.ts`

The Zustand store mirrors server state and provides actions for user interactions:

```typescript
export const useWatchio = create<WatchioStore>((set) => ({
  // State
  username: "",
  myRole: "participant",
  roomId: "",
  // ... other state properties
  
  // Actions
  createRoom: async (title, username) => {
    const roomId = generateRoomCode();
    set({ roomTitle: title, username, roomId });
    connectWatchioSocket();
    return roomId;
  },
  
  togglePlay: () => {
    // Emit play/pause event to server
    socket.emit(isPlaying ? "pause" : "play");
  },
  
  seek: (time) => {
    // Emit seek event to server
    socket.emit("seek", { time });
  }
}));
```

Socket listeners are attached in `ensureSocket()`:
```typescript
socket.on("sync_state", (state) => {
  set({
    isPlaying: state.playState.isPlaying,
    currentTime: state.playState.currentTime,
    videoId: state.playState.videoId,
    // ... hydrate full state
  });
});
```

### 2. Server-Side Room Management (OOP Architecture)

**File:** `server/src/rooms/Room.ts`

```typescript
export class Room {
  id: string;
  name: string;
  participants: Map<string, Participant>;
  playback: PlaybackState;
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.participants = new Map();
    this.playback = { isPlaying: false, currentTime: 0, videoId: "" };
  }
  
  addParticipant(participant: Participant) {
    this.participants.set(participant.id, participant);
  }
  
  removeParticipant(id: string) {
    this.participants.delete(id);
  }
  
  assignRole(userId: string, role: Role) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.role = role;
    }
  }
  
  getEffectiveTime(): number {
    // Calculate real playback position considering elapsed time
    const elapsed = (Date.now() - this.playback.lastSyncTime) / 1000;
    return this.playback.isPlaying 
      ? this.playback.currentTime + elapsed 
      : this.playback.currentTime;
  }
  
  broadcastState(io: Server) {
    io.to(this.id).emit("sync_state", {
      playState: { ...this.playback, currentTime: this.getEffectiveTime() },
      participants: Array.from(this.participants.values()),
      messages: this.messages
    });
  }
}
```

### 3. Permission-Based Event Handling

**File:** `server/src/socket/registerSocket.ts`

```typescript
socket.on("play", async () => {
  const room = roomManager.getRoomBySocket(socket.id);
  const participant = room.participants.get(socket.id);
  
  // Validate permission
  if (!permissionService.canPlay(participant.role)) {
    socket.emit("error_message", { 
      code: "PERMISSION_DENIED", 
      message: "Only hosts and moderators can play" 
    });
    return;
  }
  
  // Execute action
  room.playback.isPlaying = true;
  room.playback.lastSyncTime = Date.now();
  
  // Broadcast to room
  room.broadcastState(io);
  
  // Persist (optional)
  await persistenceService.updateRoom(room);
});
```

### 4. Real-Time Synchronization

**Mechanism:**

1. **Client emits action:** User clicks play button
2. **Server validates:** Permission check passes
3. **Server updates room state:** `playback.isPlaying = true`
4. **Server broadcasts:** `sync_state` event to all participants
5. **All clients update:** Zustand store hydrates, components re-render
6. **YouTube player syncs:** useEffect in YouTubeStage reacts to `isPlaying` change

**Time Sync Pulse:**

Every 100ms, clients emit `tick` event. Server uses this to calculate effective playback time:
```typescript
socket.on("tick", () => {
  const room = roomManager.getRoomBySocket(socket.id);
  socket.emit("sync_state", {
    playState: {
      ...room.playback,
      currentTime: room.getEffectiveTime()  // Accounts for elapsed time
    }
  });
});
```

This keeps all clients within ~100ms of playback position without constant full-state broadcasts.

### 5. YouTube Player Integration

**File:** `src/components/watchio/YouTubeStage.tsx`

```typescript
export function YouTubeStage({ videoId, isPlaying, currentTime, onTogglePlay, onSeek }) {
  const playerRef = useRef<PlayerInstance>(null);
  
  // Load YouTube API globally (once)
  useEffect(() => {
    loadYouTubeApi();
  }, []);
  
  // Create player instance
  useEffect(() => {
    if (!videoId) return;
    const player = new window.YT.Player("youtube-player", {
      videoId,
      playerVars: { autoplay: 0, controls: 0, rel: 0 }
    });
    playerRef.current = player;
    
    return () => player.destroy();
  }, [videoId]);
  
  // Sync playback state
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
  }, [isPlaying]);
  
  // Sync time position
  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(currentTime);
  }, [currentTime]);
  
  return (
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden">
      <div id="youtube-player" />
      {/* Custom controls, progress bar, etc. */}
    </div>
  );
}
```

## Troubleshooting

### Socket Connection Issues

**Problem:** "Cannot connect to WebSocket server"

**Solution:**
1. Verify backend is running: `npm run dev:server` (development) or check Render/Railway logs
2. Check `VITE_SOCKET_URL` environment variable matches backend URL
3. Ensure firewall allows WebSocket connections (port 3000 or custom)
4. Check browser console for detailed error messages

### Synchronization Drift

**Problem:** Users' playback times diverge

**Solution:**
1. Check network latency (open DevTools → Network tab)
2. Verify server receives `tick` events from clients
3. Check that `getEffectiveTime()` is being called correctly
4. Review server logs for timing calculations

### YouTube Player Not Loading

**Problem:** Video player not displaying

**Solution:**
1. Verify YouTube IFrame API is loaded: `window.YT` should exist
2. Check video ID is valid (11-character alphanumeric)
3. Ensure YouTube video is not restricted or age-gated
4. Check browser console for YouTube API errors

### Role Changes Not Working

**Problem:** Role assignment fails silently

**Solution:**
1. Verify host is the one assigning roles
2. Check server logs for permission validation errors
3. Confirm target user is in the same room
4. Verify socket connection is active (not disconnected)

## Performance Optimization

### For 1,000+ Concurrent Users

1. **Use Redis Adapter for Socket.IO:**
   ```javascript
   import { createAdapter } from "@socket.io/redis-adapter";
   
   const pubClient = redis.createClient();
   const subClient = pubClient.duplicate();
   io.adapter(createAdapter(pubClient, subClient));
   ```

2. **Horizontal Scaling:**
   - Deploy multiple Node.js instances behind a load balancer (Nginx)
   - Use sticky sessions to maintain socket affinity
   - Share room state in Redis instead of in-memory

3. **Database Optimization:**
   - Add indexes on `roomId` and `createdAt` in Prisma
   - Consider connection pooling (PgBouncer for PostgreSQL)
   - Archive old messages to separate table

4. **Frontend Optimization:**
   - Lazy-load participant list with virtualization for 50+ users
   - Debounce seek/tick events to reduce broadcast frequency
   - Use Web Workers for audio/video processing

## Future Enhancements

- [ ] User authentication (JWT + email verification)
- [ ] Persistent user profiles and watch history
- [ ] Advanced reactions (custom emojis, floating animations)
- [ ] Adaptive bitrate streaming (HLS/DASH)
- [ ] Recording watch parties for later playback
- [ ] Integration with other video platforms (Vimeo, Twitch)
- [ ] In-app notifications (Toasts/Notifications API)
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] i18n (internationalization) support

## Testing

Currently no automated tests. Future roadmap includes:

```bash
npm run test                    # Run Jest tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
```

## Contributing

This is an intern assignment project. Contributions and improvements are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Discord: [your-discord-invite]

---

**Built with ❤️ for synchronized watch parties everywhere.**

**Live URL:** [Your Render/Railway URL here]

**Last Updated:** May 2026
