# EasyCoach

Lightweight sports analytics demo (EasyCoach) — a monorepo with a NestJS backend and a React + Vite frontend.

This repository contains a simple full-stack example that integrates with the EasyCoach analytics API, exposes a small REST backend, and a React frontend that displays matches and player information.

## Features

- **Match Analytics**: Browse and view detailed match information, including events, timelines, and statistics.
- **Player Profiles**: Explore comprehensive player data, match history, skill radars, and performance metrics.
- **Video Playback**: Integrated video player for match footage with controls and event synchronization.
- **Team Lineups**: Display starting lineups, substitutions, and team formations.
- **Responsive Design**: Modern React UI built with TypeScript and Vite for fast, scalable development.
- **API Integration**: Seamless integration with EasyCoach analytics API for real-time data.

## Quick start

Prerequisites:
- Node.js 18+ and npm
- (Optional) Docker & docker-compose for local DB

1) Install dependencies for both apps

```powershell
cd backend; npm install
cd ..\frontend; npm install
```

2) Run backend in development (watch)

```powershell
cd backend; npm run start:dev
```

3) Run frontend (Vite) in development

```powershell
cd frontend; npm run dev
```

The backend listens on port `3000` by default and the frontend Vite dev server uses port `5173`.

## Environment

See `backend/.env.example` and `frontend/.env.example` for environment variables the apps use. Important backend vars:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` — MySQL connection
- `API_BASE_URL`, `API_TOKEN` — EasyCoach remote API base and token
- `CACHE_TTL` — cache TTL for backend cache manager

When running with Docker, the provided `docker-compose.yml` can be used to start a local MySQL instance.

## Build & tests

- Backend build: `cd backend; npm run build`
- Frontend build: `cd frontend; npm run build`
- Backend unit tests: `cd backend; npm run test`
- Backend e2e tests: `cd backend; npm run test:e2e`

## Project structure (high level)

- `backend/` — NestJS API, modules under `backend/src/modules/` (matches, players, etc.), TypeORM entities and migrations in `backend/src/migrations/`.
- `frontend/` — React + TypeScript app, components under `frontend/src/components/`, pages under `frontend/src/pages/`, API calls in `frontend/src/services/api.ts`.
- `github/` — project docs and agent guidance.

## Development notes

- Follow file naming conventions: kebab-case files, PascalCase React components, camelCase functions.
- Backend uses TypeORM; prefer repository migrations for schema changes.
- Frontend uses Zustand for global state and TanStack Query for server state.

## Troubleshooting

- If the backend cannot connect to MySQL, verify `DATABASE_*` env vars and check Docker container status.
- If the frontend cannot reach the backend in dev, confirm `VITE_API_URL` in `frontend/.env` and that the backend is running on `http://localhost:3000`.

## Want more?

I can:
- Wire the new components into `App.tsx` and add basic routing
- Add Jest tests for critical components and services
- Add Docker Compose examples for local development

Open an issue or tell me which of the above you'd like me to do next.
