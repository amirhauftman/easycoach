# EasyCoach Docker Setup

This project includes Docker Compose configuration for easy development and deployment with PostgreSQL.

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd easycoach
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.docker .env
   ```
   
   Edit `.env` file and add your EasyCoach API token:
   ```env
   API_TOKEN=your_easycoach_api_token_here
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432
   - PgAdmin (optional): http://localhost:5050

## Services

### Core Services
- **postgres**: PostgreSQL 15 database
- **backend**: NestJS API server
- **frontend**: React/Vite development server

### Optional Tools (use `--profile tools`)
- **pgadmin**: Web-based PostgreSQL administration tool

## Commands

### Start all services
```bash
docker-compose up -d
```

### Start with tools (including PgAdmin)
```bash
docker-compose --profile tools up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes database data)
```bash
docker-compose down -v
```

### Rebuild services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Restart specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Database Management

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d easycoach
```

### PgAdmin Access
1. Start with tools profile: `docker-compose --profile tools up -d`
2. Open http://localhost:5050
3. Login with:
   - Email: `admin@easycoach.local`
   - Password: `admin`
4. Add server connection:
   - Host: `postgres`
   - Port: `5432`
   - Database: `easycoach`
   - Username: `postgres`
   - Password: `password`

### Database Backup
```bash
docker-compose exec postgres pg_dump -U postgres easycoach > backup.sql
```

### Database Restore
```bash
docker-compose exec -T postgres psql -U postgres easycoach < backup.sql
```

## Development Workflow

### Hot Reload Development
Both frontend and backend support hot reload:
- Frontend: Vite dev server with HMR
- Backend: Volume mount allows code changes to trigger rebuilds

### Running Commands Inside Containers
```bash
# Backend commands
docker-compose exec backend npm run test
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed

# Frontend commands
docker-compose exec frontend npm run build
docker-compose exec frontend npm run test
```

### Install New Dependencies
```bash
# Backend
docker-compose exec backend npm install package-name
docker-compose build backend

# Frontend
docker-compose exec frontend npm install package-name
docker-compose build frontend
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@postgres:5432/easycoach
API_BASE_URL=https://ifa.easycoach.club/en/api/v3/analytics
API_TOKEN=your_token_here
CACHE_TTL=1800000
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Frontend (Vite)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=EasyCoach
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Change ports in `docker-compose.yml` if 3000, 5173, or 5432 are in use

2. **Database connection issues:**
   ```bash
   # Check if database is ready
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **Backend won't start:**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Ensure database is running
   docker-compose ps
   ```

4. **Frontend build issues:**
   ```bash
   # Clear node_modules and rebuild
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up -d
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove all images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### Performance Tips

1. **Use .dockerignore** files to exclude unnecessary files
2. **Multi-stage builds** for production (already configured)
3. **Volume caching** for node_modules (already configured)

## Production Deployment

For production, consider:
1. Use production Dockerfiles with multi-stage builds
2. Set `NODE_ENV=production`
3. Use external PostgreSQL service
4. Add reverse proxy (nginx)
5. Enable SSL/TLS
6. Use Docker secrets for sensitive data
7. Implement proper logging and monitoring

## Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready` command
- **Backend**: HTTP health endpoint `/health`
- **Frontend**: Built-in Vite dev server

Monitor with:
```bash
docker-compose ps
```

## File Structure
```
easycoach/
├── docker-compose.yml      # Main compose file
├── .env.docker            # Environment template
├── .env                   # Your local environment (create from .env.docker)
├── backend/
│   ├── Dockerfile         # Backend container config
│   ├── .dockerignore      # Backend ignore file
│   ├── healthcheck.js     # Health check script
│   └── init-db.sql        # Database initialization
├── frontend/
│   ├── Dockerfile         # Frontend container config
│   └── .dockerignore      # Frontend ignore file
└── DOCKER.md             # This file
```