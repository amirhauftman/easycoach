# Testing Agent Instructions - Comprehensive Testing Strategy

## Role
You are a testing specialist ensuring high-quality, maintainable test coverage across the application.

## Testing Philosophy
- **Write tests that provide value, not just coverage**
- **Test behavior, not implementation**
- **Make tests readable and maintainable**
- **Fast feedback loops**

---

## Testing Pyramid

```
         /\
        /  \
       / E2E\      ← Few (10%)
      /------\
     /  Inte- \    ← Some (20%)
    /  gration \
   /------------\
  /  Unit Tests  \ ← Many (70%)
 /________________\
```

---

## Backend Testing (NestJS + Jest)

### Unit Test Structure

```typescript
// matches.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of, throwError } from 'rxjs';
import { MatchesService } from './matches.service';
import { EasyCoachApiService } from './easycoach-api.service';

describe('MatchesService', () => {
  let service: MatchesService;
  let apiService: EasyCoachApiService;
  let cacheManager: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: EasyCoachApiService,
          useValue: {
            fetchLeagueMatches: jest.fn(),
            fetchMatchDetails: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    apiService = module.get<EasyCoachApiService>(EasyCoachApiService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMatches', () => {
    const mockMatches = [
      {
        match_id: '1',
        home_team: 'Team A',
        away_team: 'Team B',
        match_date: '2024-11-20',
      },
    ];

    it('should return cached matches if available', async () => {
      // Arrange
      const cacheKey = 'matches:726:26';
      cacheManager.get.mockResolvedValue(mockMatches);

      // Act
      const result = await service.getMatches('726', '26');

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(result.data).toEqual(mockMatches);
      expect(result.meta.cached).toBe(true);
      expect(apiService.fetchLeagueMatches).not.toHaveBeenCalled();
    });

    it('should fetch from API if cache miss', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(apiService, 'fetchLeagueMatches')
        .mockResolvedValue(mockMatches);

      // Act
      const result = await service.getMatches('726', '26');

      // Assert
      expect(apiService.fetchLeagueMatches).toHaveBeenCalledWith('726', '26');
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.meta.cached).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(apiService, 'fetchLeagueMatches')
        .mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(service.getMatches('726', '26'))
        .rejects.toThrow('API Error');
    });

    it('should group matches by date', async () => {
      // Arrange
      const multiDateMatches = [
        { match_id: '1', match_date: '2024-11-20 10:00:00' },
        { match_id: '2', match_date: '2024-11-20 14:00:00' },
        { match_id: '3', match_date: '2024-11-21 10:00:00' },
      ];
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(apiService, 'fetchLeagueMatches')
        .mockResolvedValue(multiDateMatches);

      // Act
      const result = await service.getMatches('726', '26');

      // Assert
      expect(result.data['2024-11-20']).toHaveLength(2);
      expect(result.data['2024-11-21']).toHaveLength(1);
    });
  });

  describe('getMatchById', () => {
    it('should return match details', async () => {
      // Arrange
      const mockMatch = {
        match_id: '1',
        home_team: 'Team A',
      };
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(apiService, 'fetchMatchDetails')
        .mockResolvedValue(mockMatch);

      // Act
      const result = await service.getMatchById('1');

      // Assert
      expect(result).toEqual(mockMatch);
      expect(apiService.fetchMatchDetails).toHaveBeenCalledWith('1');
    });

    it('should return null for non-existent match', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(apiService, 'fetchMatchDetails')
        .mockResolvedValue(null);

      // Act
      const result = await service.getMatchById('999');

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

### Controller Test

```typescript
// matches.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: {
            getMatches: jest.fn(),
            getMatchById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  describe('getMatches', () => {
    it('should return matches', async () => {
      // Arrange
      const mockResponse = {
        data: { '2024-11-20': [] },
        meta: { cached: false },
      };
      jest.spyOn(service, 'getMatches').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getMatches('726', '26');

      // Assert
      expect(result).toEqual(mockResponse);
      expect(service.getMatches).toHaveBeenCalledWith('726', '26');
    });
  });

  describe('getMatchById', () => {
    it('should return match details', async () => {
      // Arrange
      const mockMatch = { match_id: '1', home_team: 'Team A' };
      jest.spyOn(service, 'getMatchById').mockResolvedValue(mockMatch);

      // Act
      const result = await controller.getMatchById('1');

      // Assert
      expect(result).toEqual(mockMatch);
    });

    it('should throw 404 if match not found', async () => {
      // Arrange
      jest.spyOn(service, 'getMatchById').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getMatchById('999'))
        .rejects.toThrow(HttpException);
      await expect(controller.getMatchById('999'))
        .rejects.toThrow('Match not found');
    });
  });
});
```

### E2E Test

```typescript
// test/matches.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

describe('MatchesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await getConnection().close();
    await app.close();
  });

  describe('/api/matches (GET)', () => {
    it('should return list of matches', () => {
      return request(app.getHttpServer())
        .get('/api/matches')
        .query({ leagueId: '726', seasonId: '26' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(typeof res.body.data).toBe('object');
        });
    });

    it('should handle invalid query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/matches')
        .query({ leagueId: 'invalid' })
        .expect(400);
    });
  });

  describe('/api/matches/:id (GET)', () => {
    it('should return match details', () => {
      return request(app.getHttpServer())
        .get('/api/matches/957759')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('match_id');
          expect(res.body.data).toHaveProperty('home_team_players');
        });
    });

    it('should return 404 for non-existent match', () => {
      return request(app.getHttpServer())
        .get('/api/matches/999999')
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toHaveProperty('statusCode', 404);
        });
    });
  });
});
```

---

## Frontend Testing (React + Jest + RTL)

### Component Test

```typescript
// MatchCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MatchCard } from './MatchCard';

const mockMatch = {
  id: '1',
  homeTeam: 'Hapoel Ra\'anana U17',
  awayTeam: 'Maccabi Petah Tikva U17',
  homeScore: 2,
  awayScore: 4,
  kickoff: '2024-11-20T10:00:00Z',
  competition: 'U17 League',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MatchCard', () => {
  it('renders match information correctly', () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    expect(screen.getByText('Hapoel Ra\'anana U17')).toBeInTheDocument();
    expect(screen.getByText('Maccabi Petah Tikva U17')).toBeInTheDocument();
    expect(screen.getByText('2 - 4')).toBeInTheDocument();
    expect(screen.getByText('U17 League')).toBeInTheDocument();
  });

  it('displays team logos', () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Hapoel Ra\'anana U17');
    expect(images[1]).toHaveAttribute('alt', 'Maccabi Petah Tikva U17');
  });

  it('formats kickoff time correctly', () => {
    renderWithRouter(<MatchCard match={mockMatch} />);

    // Should display time in HH:MM format
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('navigates to match details on click', () => {
    const { container } = renderWithRouter(<MatchCard match={mockMatch} />);
    const card = container.firstChild as HTMLElement;

    fireEvent.click(card);

    // After navigation
    expect(window.location.pathname).toBe('/matches/1');
  });

  it('applies hover styles', () => {
    const { container } = renderWithRouter(<MatchCard match={mockMatch} />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-lg');
  });
});
```

### Hook Test

```typescript
// useMatches.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMatches } from './useMatches';
import { api } from '../services/api';

jest.mock('../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMatches', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches matches successfully', async () => {
    // Arrange
    const mockData = {
      data: {
        '2024-11-20': [
          { id: '1', homeTeam: 'Team A', awayTeam: 'Team B' },
        ],
      },
      meta: { cached: false },
    };
    (api.getMatches as jest.Mock).mockResolvedValue(mockData);

    // Act
    const { result } = renderHook(() => useMatches(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(api.getMatches).toHaveBeenCalledWith('726', '26');
  });

  it('handles errors correctly', async () => {
    // Arrange
    const error = new Error('API Error');
    (api.getMatches as jest.Mock).mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => useMatches(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });

  it('uses custom league and season IDs', async () => {
    // Arrange
    (api.getMatches as jest.Mock).mockResolvedValue({ data: {} });

    // Act
    const { result } = renderHook(() => useMatches('999', '50'), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getMatches).toHaveBeenCalledWith('999', '50');
  });
});
```

### Integration Test

```typescript
// MatchesPage.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MatchesPage } from './MatchesPage';
import { api } from '../services/api';

jest.mock('../services/api');

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('MatchesPage Integration', () => {
  it('displays loading state initially', () => {
    (api.getMatches as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<MatchesPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays matches grouped by date', async () => {
    // Arrange
    const mockData = {
      data: {
        '2024-11-20': [
          { 
            id: '1', 
            homeTeam: 'Team A', 
            awayTeam: 'Team B',
            homeScore: 2,
            awayScore: 1,
            kickoff: '2024-11-20T10:00:00Z',
          },
        ],
        '2024-11-21': [
          { 
            id: '2', 
            homeTeam: 'Team C', 
            awayTeam: 'Team D',
            homeScore: 0,
            awayScore: 0,
            kickoff: '2024-11-21T14:00:00Z',
          },
        ],
      },
    };
    (api.getMatches as jest.Mock).mockResolvedValue(mockData);

    // Act
    renderWithProviders(<MatchesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument();
    });
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Team C')).toBeInTheDocument();
    expect(screen.getByText('Team D')).toBeInTheDocument();

    // Check date headers
    expect(screen.getByText(/November 20, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/November 21, 2024/i)).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    // Arrange
    (api.getMatches as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    // Act
    renderWithProviders(<MatchesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Test Utilities

### Test Data Factories

```typescript
// test/factories/match.factory.ts
import { faker } from '@faker-js/faker';
import type { Match, MatchDetails, Player } from '../../src/types';

export const createMockMatch = (overrides?: Partial<Match>): Match => ({
  id: faker.string.uuid(),
  homeTeam: faker.company.name() + ' U17',
  awayTeam: faker.company.name() + ' U17',
  homeScore: faker.number.int({ min: 0, max: 5 }),
  awayScore: faker.number.int({ min: 0, max: 5 }),
  kickoff: faker.date.recent().toISOString(),
  competition: 'U17 League',
  ...overrides,
});

export const createMockPlayer = (overrides?: Partial<Player>): Player => ({
  id: faker.number.int(),
  playerId: faker.string.uuid(),
  fname: faker.person.firstName(),
  lname: faker.person.lastName(),
  number: faker.number.int({ min: 1, max: 99 }),
  position: faker.helpers.arrayElement(['GK', 'DEF', 'MID', 'FWD']),
  gameTime: faker.number.int({ min: 0, max: 90 }),
  isSub: 0,
  ...overrides,
});
```

### Custom Render Function

```typescript
// test/utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

---

## Jest Configuration

### Backend jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Frontend jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## Testing Best Practices

### DO's ✅

1. **Test user behavior, not implementation**
```typescript
// Good
expect(screen.getByText('Team A')).toBeInTheDocument();

// Bad
expect(component.state.matches).toHaveLength(5);
```

2. **Use descriptive test names**
```typescript
// Good
it('should display error message when API call fails', () => {});

// Bad
it('test 1', () => {});
```

3. **Arrange-Act-Assert pattern**
```typescript
it('should update skills', () => {
  // Arrange
  const skills = { passing: 8 };
  
  // Act
  const result = updateSkills(skills);
  
  // Assert
  expect(result.passing).toBe(8);
});
```

### DON'Ts ❌

1. **Don't test implementation details**
2. **Don't write brittle tests**
3. **Don't skip error cases**
4. **Don't test third-party libraries**
5. **Don't have flaky tests**

---

## Coverage Goals

| Type | Target Coverage |
|------|----------------|
| Backend Services | >80% |
| Controllers | >70% |
| Frontend Components | >70% |
| Custom Hooks | >80% |
| Utils/Helpers | >90% |

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm test
      - run: cd backend && npm run test:cov

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run test:cov
```

---

## Checklist Before Committing

- [ ] All tests pass locally
- [ ] Coverage meets minimum threshold
- [ ] No skipped tests (`it.skip`)
- [ ] No focused tests (`it.only`)
- [ ] Error cases covered
- [ ] Edge cases tested
- [ ] Mock data realistic
- [ ] Test names descriptive