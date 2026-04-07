# Time Tracking

A full-stack web application for tracking time spent on tasks. Users can create tasks and tags, start/stop timers, manually adjust timestamps, and analyze productivity through charts and statistics.

## Tech Stack

**Backend**
- Node.js + Express.js v5
- MongoDB (Mongoose)
- Redis (caching + refresh token storage)
- JWT authentication (access + refresh tokens)
- Nodemailer (OTP email verification)

**Frontend**
- React 19 + Vite
- React Router v7
- Axios
- Tailwind CSS v4
- Recharts (charts)
- Framer Motion (animations)
- dnd-kit (drag-and-drop)
- Radix UI (dropdown, tooltip)

## Features

- **Task Management** — Create, edit, delete tasks with tags; drag-and-drop reordering
- **Time Tracking** — Start/stop timers per task; view and edit individual timestamps
- **Statistics** — Total time tracked, most productive day, longest active streak, time per tag (pie chart), daily activity (bar chart)
- **Observation View** — Analyze task/tag activity over any custom time interval
- **Authentication** — Register with email OTP verification, JWT with rotating refresh tokens

## Project Structure

```
time_tracking/
├── backend/
│   └── src/
│       ├── config/            # db.js, redisClient.js
│       ├── controllers/       # Auth, Task, Tag, Timestamp, TaskOrder, HandlePeriod
│       ├── models/            # User, Task, Tag, Timestamp, TaskOrder
│       ├── routes/            # index.js, apiAuth, apiTask, apiTag, apiTimestamp, apiTimeForTask
│       ├── services/
│       │   └── cache/         # otpCache, tagCache, taskCache, timestampCache
│       │   # tagInterval, taskInterval, timestampByPeriod
│       ├── middlewares/       # authMiddleware, errorHandler
│       ├── validators/        # timestampValidator
│       └── utils/             # AppError, mailer, redisKey, timestampAggregation
└── frontend/
    └── src/
        ├── pages/             # Dashboard, Statistics, View, About, Setting
        ├── components/
        │   └── ui/            # dropdown-menu, tooltip (Radix UI wrappers)
        │   # TaskElement_card, Timerbutton, forms, SortableItem, Sidebar, etc.
        ├── context/           # TasksAndTagsContext, IntervalContext, SettingsContext
        ├── api/               # Auth, Tasks, Tags, Timestamps
        ├── lib/               # utils.js (shadcn/cn helper)
        ├── assets/            # avatar.jpg
        └── utils/             # Time.js, NormalizeTaskId.js
```

## API Overview

All routes except auth require `Authorization: Bearer <accessToken>`.

| Resource | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | `POST /register`, `POST /verify`, `POST /login`, `POST /logout`, `POST /refresh` |
| Tasks | `/api/tasks` | Full CRUD + analytics endpoints (stats, bar chart, intervals) |
| Tags | `/api/tags` | Full CRUD + tag activity interval queries |
| Timestamps | `/api/timestamps` | Full CRUD + aggregations by period, daily, hourly, per-tag |
| Task Timestamps | `/api/timesfortask` | `GET /:taskId`, `GET /:taskId/:type` |

### Auth Flow

1. `POST /api/auth/register` — hashes password, sends OTP to email (stored in Redis)
2. `POST /api/auth/verify` — verifies OTP, creates user in MongoDB
3. `POST /api/auth/login` — returns access token (15m) + sets httpOnly refresh token cookie (7d, stored in Redis)
4. `POST /api/auth/refresh` — rotates token pair (old token invalidated in Redis)
5. `POST /api/auth/logout` — deletes refresh token from Redis, clears cookie

### Timestamp Model

Each activity session is represented as a `start` and `end` timestamp document. End timestamps include a `startRef` field pointing to their paired start, enabling precise duration calculation and overlap detection.

## Getting Started

**Prerequisites**: Node.js 18+, MongoDB (Atlas or local), Redis

**Backend**

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
ACCESS_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
EMAIL=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

```bash
npm run dev
# Runs on http://localhost:3000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`.
