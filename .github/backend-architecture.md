# Backend Architecture Agent - NestJS Best Practices

## Role
You are a backend architecture specialist focusing on scalable, maintainable NestJS applications.

## Architecture Patterns

### Layered Architecture
```
┌─────────────────────────────────────┐
│         Controller Layer            │
│   (HTTP Handlers, Validation)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Service Layer              │
│    (Business Logic, Orchestration)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Repository Layer             │
│     (Data Access, TypeORM)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           Database                  │
│            (MySQL)                  │
└─────────────────────────────────────┘
```

---

## Main Application Structure

### app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import configuration from './config/configuration';

// Feature modules
import { MatchesModule } from './modules/matches/matches.module';
import { PlayersModule } from './modules/players/players.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    // Cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('cache.ttl') * 1000,
        max: 100,
      }),
    }),

    // HTTP Client
    HttpModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),

    // Feature modules
    MatchesModule,
    PlayersModule,
  ],
})
export class AppModule {}
```

### main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EasyCoach API')
    .setDescription('Sports analytics API')
    .setVersion('1.0')
    .addTag('matches')
    .addTag('players')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

## Feature Module Structure

### matches.module.ts
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { EasyCoachApiService } from './easycoach-api.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, EasyCoachApiService],
  exports: [MatchesService],
})
export class MatchesModule {}
```

### External API Service Pattern
```typescript
// easycoach-api.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class EasyCoachApiService {
  private readonly logger = new Logger(EasyCoachApiService.name);
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('api.baseUrl');
    this.token = this.configService.get<string>('api.token');
  }

  async fetchLeagueMatches(leagueId: string, seasonId: string) {
    try {
      this.logger.log(`Fetching matches for league ${leagueId}, season ${seasonId}`);
      
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/league`, {
          params: {
            league_id: leagueId,
            season_id: seasonId,
            user_token: this.token,
          },
        }),
      );

      this.logger.log(`Successfully fetched ${data?.length || 0} matches`);
      return data;
    } catch (error) {
      this.handleError(error, 'fetchLeagueMatches');
    }
  }

  async fetchMatchDetails(matchId: string) {
    try {
      this.logger.log(`Fetching match details for ${matchId}`);
      
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/match`, {
          params: {
            match_id: matchId,
            user_token: this.token,
          },
        }),
      );

      return data;
    } catch (error) {
      this.handleError(error, 'fetchMatchDetails');
    }
  }

  private handleError(error: unknown, context: string): never {
    if (error instanceof AxiosError) {
      this.logger.error(
        `API Error in ${context}: ${error.message}`,
        error.stack,
      );
      throw new Error(`EasyCoach API Error: ${error.message}`);
    }
    throw error;
  }
}
```

---

## Common Interceptors

### Transform Interceptor
```typescript
// common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta: {
    timestamp: string;
    cached?: boolean;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: data?.data !== undefined ? data.data : data,
        meta: {
          timestamp: new Date().toISOString(),
          cached: data?.meta?.cached || false,
        },
      })),
    );
  }
}
```

### Logging Interceptor
```typescript
// common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;
        
        this.logger.log(
          `${method} ${url} ${statusCode} - ${delay}ms`,
        );
      }),
    );
  }
}
```

---

## Database Migrations

### Create Migration
```bash
npm run typeorm migration:create src/migrations/CreatePlayerSkills
```

### Migration File
```typescript
// migrations/1700000000000-CreatePlayerSkills.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePlayerSkills1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'player_skills',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'player_id',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'passing',
            type: 'int',
            default: 5,
          },
          {
            name: 'dribbling',
            type: 'int',
            default: 5,
          },
          {
            name: 'speed',
            type: 'int',
            default: 5,
          },
          {
            name: 'defending',
            type: 'int',
            default: 5,
          },
          {
            name: 'physical',
            type: 'int',
            default: 5,
          },
          {
            name: 'potential',
            type: 'int',
            default: 5,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'player_skills',
      new TableIndex({
        name: 'IDX_PLAYER_SKILLS_PLAYER_ID',
        columnNames: ['player_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('player_skills');
  }
}
```

---

## Environment Configuration

### configuration.ts
```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'easycoach',
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || 
      'https://ifa.easycoach.club/en/api/v3/analytics',
    token: process.env.API_TOKEN || 
      'YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe',
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // seconds
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});
```

### .env.example
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=easycoach

# External API
API_BASE_URL=https://ifa.easycoach.club/en/api/v3/analytics
API_TOKEN=YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe

# Cache
CACHE_TTL=300

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Docker Configuration

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: easycoach-mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: easycoach
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: easycoach-backend
    environment:
      DATABASE_HOST: mysql
      DATABASE_PORT: 3306
      DATABASE_USER: root
      DATABASE_PASSWORD: password
      DATABASE_NAME: easycoach
      API_BASE_URL: https://ifa.easycoach.club/en/api/v3/analytics
      API_TOKEN: YZ3p3MUqQV3KArSSqOrz8SwEIfyFRxRe
      CACHE_TTL: 300
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: easycoach-frontend
    environment:
      VITE_API_URL: http://localhost:3000
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mysql_data:
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate -d src/config/typeorm.config.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/config/typeorm.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/config/typeorm.config.ts"
  }
}
```

---

## Architectural Decisions

### When to Use Cache
- ✅ External API responses (5-10 min TTL)
- ✅ Aggregated statistics
- ✅ Frequently accessed data
- ❌ User input data
- ❌ Real-time updates

### When to Use Database
- ✅ User preferences (player skills)
- ✅ Application state
- ✅ Historical data
- ❌ API responses (use cache instead)

### Error Handling Strategy
1. **Controller Level**: Catch and return proper HTTP status
2. **Service Level**: Log errors, throw custom exceptions
3. **Global Filter**: Format all errors consistently
4. **External API**: Wrap in try-catch, provide fallback

---

## Performance Optimization

### Database Indexing
```typescript
@Entity()
@Index(['playerId'])
export class PlayerSkills {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  playerId: string;
  
  // ...
}
```

### Query Optimization
```typescript
// Bad: N+1 query problem
const players = await playerRepository.find();
for (const player of players) {
  player.skills = await skillsRepository.findOne({ playerId: player.id });
}

// Good: Use relations
const players = await playerRepository.find({
  relations: ['skills'],
});
```

### Caching Strategy
```typescript
// Aggressive caching for static data
@Cacheable({ ttl: 3600 }) // 1 hour
async getTeams() {}

// Short caching for dynamic data
@Cacheable({ ttl: 300 }) // 5 minutes
async getMatches() {}

// No caching for user data
async updatePlayerSkills() {}
```

---

## Security Best Practices

### Input Validation
```typescript
// Always use DTOs with class-validator
export class UpdateSkillsDto {
  @IsInt()
  @Min(1)
  @Max(10)
  passing: number;
}
```

### SQL Injection Prevention
```typescript
// TypeORM automatically handles parameterization
// Never use raw queries with user input
```

### Environment Variables
```typescript
// Never hardcode sensitive data
// Always use ConfigService
constructor(private configService: ConfigService) {
  this.apiToken = this.configService.get('api.token');
}
```

---

## Monitoring and Logging

### Structured Logging
```typescript
this.logger.log({
  message: 'Match fetched',
  matchId,
  duration: Date.now() - startTime,
  cached: true,
});
```

### Health Check
```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## Checklist for New Features

- [ ] Module created with proper structure
- [ ] DTOs with validation
- [ ] Service with business logic
- [ ] Controller with proper decorators
- [ ] Entity with indexes
- [ ] Unit tests (>80% coverage)
- [ ] E2E tests for critical paths
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Swagger documentation
- [ ] Environment variables used
- [ ] Caching strategy defined