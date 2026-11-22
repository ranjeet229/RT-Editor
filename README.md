# RT Editor

RT Editor is a real-time collaborative code editor built with React, Monaco
Editor, Yjs, and Socket.IO. Multiple users can open the same editor, enter a
username, and see shared code changes and active users in real time.

## Features

- Monaco-powered JavaScript editor
- Real-time collaborative editing with Yjs
- Socket.IO transport for synchronization
- Active-user list with heartbeat-based presence
- Express health-check endpoint
- Docker image that builds and serves the frontend from the backend

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Monaco Editor
- **Collaboration:** Yjs, `y-monaco`, `y-socket.io`
- **Backend:** Node.js, Express, Socket.IO
- **Containerization:** Docker

## Prerequisites

- Node.js 20 or later
- npm
- Docker (optional)

## Local Development

The frontend and backend are separate applications during development.

### 1. Start the backend

```bash
cd Backend
npm install
npm run dev
```

The backend runs at `http://localhost:3000`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

Open the frontend in multiple browser windows or tabs to test collaborative
editing. Use a different username in each window.

## Production Build with Docker

The Dockerfile builds the frontend first, copies its `dist` output into the
backend's `public` directory, and then starts the backend server.

```bash
docker build -t rt-editor .
docker run --rm -p 3000:3000 rt-editor
```

Open `http://localhost:3000` after the container starts.

## Useful Commands

### Frontend

```bash
cd frontend
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

### Backend

```bash
cd Backend
npm run dev       # Start with nodemon
npm start         # Start with Node.js
```

## API

### `GET /health`

Returns a JSON response confirming that the backend is running:

```json
{
  "message": "ok",
  "success": true
}
```

## Project Structure

```text
.
├── Backend/
│   ├── server.js        # Express and Socket.IO server
│   └── public/          # Built frontend served in production
├── frontend/
│   ├── src/app/App.jsx  # Editor and collaboration UI
│   └── package.json     # Frontend scripts and dependencies
├── Dockerfile           # Multi-stage production image
└── README.md
```

