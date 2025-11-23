# EasyCoach

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

Lightweight sports analytics demo (EasyCoach) — a monorepo with a NestJS backend and a React + Vite frontend.

This repository contains a simple full-stack example that integrates with the EasyCoach analytics API, exposes a small REST backend, and a React frontend that displays matches and player information.

## 🚀 Features

- **Match Analytics**: Browse and view detailed match information, including events, timelines, and statistics.
- **Player Profiles**: Explore comprehensive player data, match history, skill radars, and performance metrics.
- **Video Playback**: Integrated video player for match footage with controls and event synchronization.
- **Team Lineups**: Display starting lineups, substitutions, and team formations.
- **Responsive Design**: Modern React UI built with TypeScript and Vite for fast, scalable development.
- **API Integration**: Seamless integration with EasyCoach analytics API for real-time data.
- **Health Checks**: Built-in endpoints for monitoring backend health and database connectivity.
- **API Documentation**: Interactive Swagger/OpenAPI docs at `/api/docs`.

## 🏗️ Architecture

- **Backend**: NestJS API with TypeORM and PostgreSQL, modules for matches, players.
- **Frontend**: React + TypeScript app with Vite, Zustand for global state, TanStack Query for server state.
- **Database**: PostgreSQL with TypeORM migrations.
- **Testing**: Jest for backend, Vitest for frontend components.

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/amirhauftman/easycoach.git
   cd easycoach
   ```

2. **Install dependencies**
   ```powershell
   cd backend; npm install
   cd ..\frontend; npm install
   ```

3. **Set up environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
   - Update the values as needed (see Environment section below)

4. **Run the backend**
   ```powershell
   cd backend; npm run start:dev
   ```

5. **Run the frontend** (in a new terminal)
   ```powershell
   cd frontend; npm run dev
   ```

The backend listens on port `3000` by default and the frontend Vite dev server uses port `5173`.

Visit `http://localhost:5173` to access the application.

## 🔧 Environment Variables

Environment variables are configured in `.env` files (not committed to git).

### Backend (`.env`)
- `DATABASE_URL` — Complete PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/dbname`)
- `API_BASE_URL`, `API_TOKEN` — EasyCoach remote API base and token
- `CACHE_TTL` — Cache TTL for backend cache manager (default: 1800000 ms)
- `FRONTEND_URL` — Frontend URL for CORS configuration (default: `http://localhost:5173`)
- `NODE_ENV` — Environment mode (development/production/test)
- `PORT` — Backend port (default: 3000)

### Frontend (`.env`)
- `VITE_API_BASE_URL` — Backend API base URL (default: `http://localhost:3000`)

## 🏃 Build & Test

### Backend
- **Development**: `cd backend; npm run start:dev`
- **Production build**: `cd backend; npm run build` then `cd backend; npm run start:prod`
- **Unit tests**: `cd backend; npm run test`
- **E2E tests**: `cd backend; npm run test:e2e`

### Frontend
- **Development**: `cd frontend; npm run dev`
- **Build**: `cd frontend; npm run build`
- **Preview**: `cd frontend; npm run preview`
- **Tests**: `cd frontend; npm run test`

## 📁 Project Structure

```
easycoach/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/           # Feature modules (matches, players)
│   │   ├── config/            # Configuration files
│   │   └── common/            # Shared utilities
│   └── test/                  # E2E tests
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── stores/            # Zustand stores
│   │   └── hooks/             # Custom React hooks
│   └── public/                # Static assets
├── .github/                   # GitHub workflows and docs
└── README.md
```

## 🛠️ Development

### Conventions
- **File naming**: kebab-case for files, PascalCase for React components, camelCase for functions/variables.
- **Backend**: NestJS pattern with modules containing controller, service, DTOs, entities.
- **Frontend**: Component-driven with typed props, Zustand for global state, TanStack Query for server data.
- **API calls**: Centralized in `frontend/src/services/easycoach-api.ts` with axios interceptors.
- **Tests**: Backend uses Jest; frontend uses Vitest.

## 🔍 API Documentation

Once the backend is running, visit `http://localhost:3000/api/docs` for interactive Swagger documentation.

## 🐛 Troubleshooting

- **Database connection issues**: Verify `DATABASE_URL` in `backend/.env`.
- **Frontend can't reach backend**: Ensure backend is running on `http://localhost:3000` and CORS is configured.
- **Port conflicts**: Change ports in `.env` files if needed.
- **Build errors**: Ensure Node.js version is 18+ and dependencies are installed.
- **Tests failing**: Check database setup for e2e tests.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run tests: `cd backend; npm run test` and `cd frontend; npm run test`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.
