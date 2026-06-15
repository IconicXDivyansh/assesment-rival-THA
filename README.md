# Task Manager — Full Stack Application

A full-stack task management application with JWT authentication, CRUD operations, search, sort, filtering, dark mode, optimistic UI, and Docker support.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (Express.js)  │     │   (Supabase)    │
│   Port 3000     │     │   Port 8000     │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

The frontend communicates with the backend exclusively through Next.js Server Actions. The browser never makes direct API calls — all requests go server-to-server. Auth tokens are stored in httpOnly cookies (not accessible by JavaScript).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, coss/ui |
| Backend | Express.js 5, TypeScript, Node.js 24 |
| Database | PostgreSQL 16 via Supabase |
| ORM | Drizzle ORM |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Validation | Zod v4 (backend + frontend) |
| Testing | Vitest + Supertest |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 11+
- Docker (optional, for containerized setup)

### Option 1: Docker (one command)

```bash
docker compose up --build
```

This starts PostgreSQL, backend (with auto schema migration), and frontend. Visit http://localhost:3000.

### Option 2: Manual Setup

**1. Backend:**

```bash
cd backend
cp .env.example .env   # Fill in your DATABASE_URL and JWT_SECRET
pnpm install
pnpm drizzle-kit push  # Create database tables
node src/index.ts      # Start server on :8000
```

**2. Frontend:**

```bash
cd frontend
cp .env.example .env   # Set API_URL to your backend
pnpm install
pnpm dev               # Start dev server on :3000
```

### Option 3: Production Deployment

- **Backend:** Deploy to Render (Web Service)
  - Root directory: `backend`
  - Build: `pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild bcrypt`
  - Start: `pnpm drizzle-kit push && node src/index.ts`
- **Frontend:** Deploy to Vercel
  - Root directory: `frontend`
  - Framework: Next.js (auto-detected)
  - Env: `API_URL=https://your-backend.onrender.com`

## Environment Variables

### Backend (`backend/.env`)

```
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb
JWT_SECRET=your-secret-key-change-this
```

### Frontend (`frontend/.env`)

```
API_URL=http://localhost:8000
```

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Create account, returns JWT |
| POST | /auth/login | Login, returns JWT |

### Tasks (Protected — requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List tasks (filter, sort, search, paginate) |
| GET | /tasks/:id | Get single task |
| POST | /tasks | Create task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

**Query params for GET /tasks:**

```
?status=pending          # Filter by status
&search=meeting          # Search by title (case-insensitive)
&sort=dueDate            # Sort by: createdAt, dueDate, priority
&order=asc              # Order: asc or desc
&page=1&limit=20        # Pagination
```

## Testing

```bash
cd backend
pnpm test
```

Runs 3 integration tests:
- Signup creates user and returns token
- Login rejects wrong password
- Authenticated task creation returns 201

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express app (exported for testing)
│   │   ├── index.ts             # Server entry point
│   │   ├── controllers/         # Route handlers (auth + tasks)
│   │   ├── routes/              # Route definitions
│   │   ├── middlewares/         # JWT auth middleware
│   │   ├── db/                  # Drizzle connection + schema
│   │   ├── types/               # Zod validation schemas
│   │   └── tests/               # Vitest integration tests
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   └── vitest.config.ts
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── (auth)/              # Login/signup (public routes)
│   │   └── dashboard/           # Task dashboard (protected)
│   ├── components/              # UI components
│   ├── lib/                     # Utilities + validation schemas
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## Features

### Core (Required)

- [x] REST API with full CRUD for tasks
- [x] PostgreSQL persistence with Drizzle ORM
- [x] Input validation with Zod (backend + frontend)
- [x] Proper HTTP status codes and consistent error responses
- [x] JWT authentication with bcrypt password hashing
- [x] Protected routes — users only see their own tasks
- [x] Auth state persisted via httpOnly cookies
- [x] Task list with status filter and client-side pagination
- [x] Create and edit task forms with client-side validation
- [x] Mark tasks as complete, delete with confirmation
- [x] Loading, empty, and error states
- [x] Responsive layout (mobile + desktop)
- [x] Search tasks by title
- [x] Sort by due date, priority, created date
- [x] Filters, search, and sort work together
- [x] 3 meaningful backend integration tests

### Bonus (Implemented)

- [x] Dark mode with persisted preference (no flash on load)
- [x] Dockerized setup with docker-compose (one-command local dev)
- [x] CI pipeline (GitHub Actions — type check + build on push)
- [x] Optimistic UI with React 19 useOptimistic

## Design Decisions

- **Server Actions over client fetch** — Frontend mutations go through Next.js server actions, keeping the API URL hidden from the browser and enabling httpOnly cookie auth.
- **httpOnly cookies over localStorage** — Tokens stored in cookies are immune to XSS attacks. JavaScript cannot access them.
- **Separate backend** — Express.js gives full control over the API layer, middleware, and deployment. Matches the assessment requirement.
- **Client-side filtering + server-side support** — Backend supports full query params (sort, search, filter). Frontend also filters client-side for instant UX on small datasets.
- **Drizzle over Prisma** — Lightweight, stays close to SQL, better TypeScript inference, no binary dependencies.

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens in httpOnly cookies (not accessible by JavaScript)
- Helmet security headers on all responses
- CORS configured
- Request body size limited (10kb)
- UUID validation on all :id params
- Generic error messages (no internal details leaked)
- User-scoped queries (authorization enforced on every endpoint)
- Input validation on all write endpoints (Zod)
