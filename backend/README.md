# EasyCoach Backend

Backend API for EasyCoach, a comprehensive soccer/football match analysis and player performance tracking platform built with NestJS and TypeORM.

## Overview

The EasyCoach backend provides REST APIs for:
- **Match Management**: Create, retrieve, and manage match data
- **Player Management**: Track player information, statistics, and performance metrics
- **Match Events**: Record and analyze in-game events (goals, fouls, substitutions, etc.)
- **Team Lineups**: Manage starting lineups and substitutions
- **Video Analysis**: Support match video processing and playback with event synchronization

## Project Setup

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
```

## Environment Configuration

See `.env.example` for required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`: MySQL database configuration
- `DB_USERNAME`, `DB_PASSWORD`: Database credentials

## Development

```bash
# Start dev server with hot reload
npm run start:dev

# Start in watch mode
npm run start

# Production build
npm run build

# Production run
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── modules/
│   ├── matches/          # Match-related controllers, services, DTOs, entities
│   ├── players/          # Player management
│   └── [other-modules]/  # Additional feature modules
├── config/               # Configuration files
│   ├── configuration.ts  # App configuration
│   └── typeorm.config.ts # Database configuration
├── migrations/           # Database migrations
└── main.ts              # Application entry point
```

## Key Features

### Match Management
- CRUD operations for matches
- Home/away team information
- Match metadata (date, venue, duration)
- Event tracking and analysis

### Player Management
- Player profiles with statistics
- Performance metrics
- Match history
- Skill ratings and comparisons

### Match Events
- Real-time event logging
- Event types: goals, assists, fouls, substitutions, cards
- Timestamp and player tracking
- Event analytics

### Database
- MySQL with TypeORM ORM
- Automated migrations for schema management
- Normalized data structure for scalability

## API Documentation

API endpoints are structured as follows:

- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get match details
- `GET /api/players/:id` - Get player information
- `GET /api/players/:id/matches` - Get player's match history
- `GET /api/matches/:id/events` - Get match events

## Common Commands

```bash
# Run migrations
npm run typeorm migration:run

# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Revert migration
npm run typeorm migration:revert
```

## Technologies

- **Framework**: NestJS
- **Database**: MySQL + TypeORM
- **Language**: TypeScript
- **Testing**: Jest
- **API Style**: RESTful

## Contributing

1. Follow the established module structure
2. Create DTOs for request/response payloads
3. Implement service layer logic
4. Add unit tests for services
5. Document API endpoints

## License

Proprietary - EasyCoach Project

