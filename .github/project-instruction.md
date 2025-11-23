# GitHub Copilot Instructions for EasyCoach Sports Analytics App

## Project Overview
Full-stack sports analytics application integrating with EasyCoach API to display matches, players, and statistics.

## Tech Stack
- **Frontend**: React 18, TypeScript, TanStack Query, Zustand, Zod
- **Backend**: NestJS, TypeORM, MySQL
- **Testing**: Jest, React Testing Library, Supertest
- **DevOps**: Currently using local development setup (no Docker files)

## Architecture Principles
1. **Separation of Concerns**: Clear separation between API, business logic, and data layers
2. **Type Safety**: Full TypeScript coverage with Zod validation
3. **Caching Strategy**: API responses cached for 5 minutes to reduce external calls
4. **Error Handling**: Centralized error handling with proper HTTP status codes
5. **Code Organization**: Feature-based structure for scalability

## File Structure
```
easycoach/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── health/
│   │   │   ├── matches/
│   │   │   └── players/
│   │   ├── common/
│   │   │   └── filters/
│   │   ├── config/
│   │   ├── migrations/
│   │   └── [app files]
│   ├── scripts/
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── matches/
│   │   │   ├── players/
│   │   │   └── video/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   └── test/
│   └── public/
├── .github/
│   ├── copilot-instructions.md
│   ├── project-instruction.md
│   ├── project-structure.md
│   ├── PRD.md
│   ├── backend-architecture.md
│   └── test-instruction.md
└── [root config files]
```

## Naming Conventions
- **Files**: kebab-case (e.g., `match-details.tsx`)
- **Components**: PascalCase (e.g., `MatchList`)
- **Functions/Variables**: camelCase (e.g., `fetchMatchData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `MatchDetailsResponse`)

## Code Style Guidelines

### TypeScript
- Use explicit return types for functions
- Prefer interfaces over types for object shapes
- Use const assertions where appropriate
- Avoid `any` - use `unknown` if type is truly unknown

### React Components
- Functional components with TypeScript
- Custom hooks for complex logic
- Proper prop typing with interfaces
- Use React.memo for expensive components

### NestJS Services
- Dependency injection for all services
- DTOs for all request/response objects
- Use decorators for validation
- Repository pattern for database access

## Testing Strategy
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: API endpoints with test database
- **E2E Tests**: Critical user flows
- **Component Tests**: React components with React Testing Library

## Environment Variables
```env
# Backend
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=easycoach
API_BASE_URL=https://ifa.easycoach.club/en/api/v3/analytics
API_TOKEN=YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe
CACHE_TTL=300

# Frontend
VITE_API_URL=http://localhost:3000
```

## Git Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Build process or auxiliary tool changes

## API Integration Patterns
- Use axios with interceptors for error handling
- Implement retry logic for failed requests
- Cache GET requests with appropriate TTL
- Transform API responses to match internal types

## State Management Rules
- Zustand for global app state (user preferences, theme)
- TanStack Query for server state (API data)
- Local state for component-specific data
- No prop drilling - use context or stores

## Common Copilot Prompts

### Generate a new module
```
Create a NestJS module for [feature] with controller, service, DTOs, and entity
```

### Generate React component
```
Create a React component [ComponentName] with TypeScript, props interface, and proper typing
```

### Generate tests
```
Write unit tests for [function/class] covering happy path and edge cases
```

### Generate API integration
```
Create a service to fetch [resource] from EasyCoach API with caching and error handling
```

## Performance Considerations
- Lazy load routes with React.lazy
- Implement virtual scrolling for long lists
- Use React Query's stale-while-revalidate pattern
- Optimize images with proper sizing
- Index database queries appropriately

## Security Best Practices
- Validate all inputs with Zod
- Sanitize user inputs
- Use parameterized queries (TypeORM handles this)
- Don't expose internal errors to client
- Rate limit API endpoints

## Documentation Standards
- JSDoc comments for public APIs
- README for each major module
- API documentation with examples
- Component props documentation

## When to Ask for Clarification
- Ambiguous business logic requirements
- Missing type definitions
- Unclear error handling strategy
- Performance optimization trade-offs
- Security-sensitive operations