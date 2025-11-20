# Copilot instructions — EasyCoach

Quick reference for AI coding agents to be productive in this repo.

## Big picture
- Monorepo with two main apps: `backend/` (NestJS + TypeORM + MySQL) and `frontend/` (React + TypeScript + Vite).
- Backend exposes REST APIs, implements business logic in Nest modules under `backend/src/modules/`, and persists via TypeORM entities/migrations in `backend/src/migrations/`.
- Frontend is a component-driven React app: UI components under `frontend/src/components/`, pages under `frontend/src/pages/`, server calls in `frontend/src/services/api.ts`, and global state in `frontend/src/stores/useAppStore.ts`.

## Where to look first (examples)
- Backend boot: `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/config/configuration.ts`.
- Typical module: `backend/src/modules/<feature>/<feature>.module.ts` with `*.controller.ts`, `*.service.ts`, `dto/` and `entities/`.
- Frontend entry: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/services/api.ts`.
- Tests: `*.spec.ts` files live alongside code (`backend/src/modules/**/*.spec.ts`, `frontend/src/components/**/*.test.tsx`).
- Repo-level agent docs: `github/project-instruction.md` and `github/project-structure.md` (use these as canonical guidance to merge into any generated content).

## Build / Run / Test (exact commands)
- Backend (from repo root):
  - Install: `cd backend; npm install`
  - Dev server (watch): `cd backend; npm run start:dev`
  - Prod build: `cd backend; npm run build` then `cd backend; npm run start:prod`
  - Unit tests: `cd backend; npm run test`
  - E2E tests: `cd backend; npm run test:e2e`
- Frontend (from repo root):
  - Install: `cd frontend; npm install`
  - Dev server (Vite): `cd frontend; npm run dev`
  - Build: `cd frontend; npm run build`
  - Preview production build: `cd frontend; npm run preview`

## Project-specific conventions (do not invent alternatives)
- File naming: kebab-case for files, PascalCase for React components, camelCase for functions/variables.
- NestJS pattern: one feature = module containing controller, service, dto, entity; DTOs go under `dto/`, entities under `entities/`.
- Tests: Use Jest. Unit and e2e tests follow `*.spec.ts` naming. Backend root jest config lives in `backend/package.json`'s `jest` section.
- State patterns: frontend uses Zustand for app/global state and TanStack Query for server data. Avoid prop-drilling; use stores/hooks.
- API calls: central `frontend/src/services/api.ts` with axios (interceptors + retry + caching patterns documented in `github/project-instruction.md`).

## Common code generation patterns (examples)
- When asked to scaffold a new backend feature `ratings`:
  - Create `backend/src/modules/ratings/ratings.module.ts`, `ratings.controller.ts`, `ratings.service.ts`, `dto/create-rating.dto.ts`, `entities/rating.entity.ts` and `ratings.service.spec.ts`.
  - Register module in `backend/src/app.module.ts` if not automatically discovered.
- For frontend components:
  - Create `frontend/src/components/<feature>/<FeatureName>.tsx` using a typed props interface, add a `*.test.tsx` for rendering + important interactions, and wire into page under `frontend/src/pages/` if route needed.

## Integration & infra notes
- Backend uses TypeORM (`typeorm` package) and stores migrations in `backend/src/migrations/` — prefer repository migrations for schema changes.
- DB is MySQL (see `backend/.env.example` and `backend/README.md`). Local dev commonly uses Docker (top-level `docker-compose.yml` referenced in docs).

## Helpful examples to reference in prompts
- Use `backend/src/modules/matches/*` as the canonical backend module example (controller/service/DTO/tests).
- Use `frontend/src/components/matches/MatchCard.tsx` and `frontend/src/hooks/useMatches.ts` as canonical React + data-fetch examples.

## What to avoid / assumptions not to make
- Do not change global repo structure (move folders) without explicit user approval.
- Don’t replace TypeORM with Prisma or change DB strategy; follow existing TypeORM patterns and migrations.
- Don't assume environment variables; prefer reading `backend/.env.example` and `frontend/.env.example` and ask when values are missing.

## Example prompts agents should use
- "Create a NestJS module `X` with controller, service, DTOs, entity, and unit tests matching patterns from `backend/src/modules/matches/`."
- "Add a React component `Y` with typed props and a Jest test; follow `frontend/src/components/common/Button.tsx` patterns." 

## Where to update or ask
- If behaviour or API contract is unclear, point to `github/project-instruction.md` and open an issue or ask the repo owner for business logic clarification.

---
If anything here is unclear or you want more detail for specific tasks (e.g., migration workflow, docker-compose setup, or CI commands), tell me which area to expand.