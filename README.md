# Task Manager — Full Stack Application

A full-stack task management application with authentication, CRUD operations, search, sort, filtering, and dark mode.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (Express.js)  │     │   (Supabase)    │
│   Port 3000     │     │   Port 8000     │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Frontend** calls the backend via Server Actions (server-side fetch). The API URL is never exposed to the browser. Auth tokens are stored in httpOnly cookies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, coss/ui |
| Backend | Express.js 5, TypeScript, Node.js 24 |
| Database | PostgreSQL 16 via Supabase |
| ORM | Drizzle ORM |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Validation | Zod (backend + frontend) |
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

This starts PostgreSQL, backend, and frontend. Visit http://localhost:3000.

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
cp .env.example .env   # Add your DATABASE_URL and JWT_SECRET
pnpm install
pnpm drizzle-kit push  # Create tables
node src/index.ts      # Start server on :8000
```

**Frontend:**

```bash
cd frontend
pnpm install
pnpm dev               # Start dev server on :3000
```

## Environment Variables

### Backend (.env)

```
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb
JWT_SECRET=your-secret-key
```

### Frontend

```
API_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/signup | Create account | No |
| POST | /auth/login | Login | No |
| GET | /tasks | List tasks (filter, sort, paginate) | Yes |
| GET | /tasks/:id | Get single task | Yes |
| POST | /tasks | Create task | Yes |
| PATCH | /tasks/:id | Update task | Yes |
| DELETE | /tasks/:id | Delete task | Yes |

Query params for GET /tasks: `?status=pending&search=meeting&sort=dueDate&order=asc&page=1&limit=20`

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry
│   │   ├── controllers/          # Route handlers
│   │   ├── routes/               # Route definitions
│   │   ├── middlewares/          # Auth middleware
│   │   ├── db/                   # Drizzle connection + schema
│   │   └── types/                # Zod validation schemas
│   ├── Dockerfile
│   └── drizzle.config.ts
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── (auth)/               # Login/signup routes
│   │   └── dashboard/            # Protected task dashboard
│   ├── components/               # UI components
│   ├── lib/                      # Utilities + schemas
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Features Implemented

### Core
- REST API with full CRUD
- JWT authentication with bcrypt password hashing
- User-scoped task access (users only see their own tasks)
- Input validation (Zod on backend + frontend)
- Status filtering, search by title, sort by date/priority
- Client-side pagination
- Responsive design (mobile + desktop)

### Frontend
- Server Actions (React 19 + Next.js)
- useActionState for form handling
- httpOnly cookies (XSS-proof token storage)
- Dark mode with persisted preference
- Loading, empty, and error states
- coss/ui component library

### Bonus
- Dockerized setup (one-command local dev)
- Dark mode with theme toggle
- Tooltips on action buttons
- Fluid typography with CSS clamp()

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens in httpOnly cookies (not accessible by JavaScript)
- Helmet security headers
- CORS configured
- Request body size limited (10kb)
- UUID validation on all :id params
- Generic error messages (no information leakage)
- User-scoped queries (authorization on every endpoint)
