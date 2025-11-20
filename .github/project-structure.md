easycoach-app/
├── .copilot/
│   ├── instructions.md              # Main Copilot instructions
│   ├── prd.md                       # Product Requirements Document
│   ├── api-agent.md                 # API development instructions
│   ├── ui-agent.md                  # Frontend development instructions
│   ├── backend-agent.md             # Backend architecture instructions
│   ├── testing-agent.md             # Testing instructions
│   └── architecture-agent.md        # System architecture docs
│
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   └── logging.interceptor.ts
│   │   │   ├── pipes/
│   │   │   └── guards/
│   │   │
│   │   ├── config/
│   │   │   ├── configuration.ts
│   │   │   └── typeorm.config.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── matches/
│   │   │   │   ├── matches.module.ts
│   │   │   │   ├── matches.controller.ts
│   │   │   │   ├── matches.controller.spec.ts
│   │   │   │   ├── matches.service.ts
│   │   │   │   ├── matches.service.spec.ts
│   │   │   │   ├── easycoach-api.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── match-query.dto.ts
│   │   │   │
│   │   │   └── players/
│   │   │       ├── players.module.ts
│   │   │       ├── players.controller.ts
│   │   │       ├── players.controller.spec.ts
│   │   │       ├── players.service.ts
│   │   │       ├── players.service.spec.ts
│   │   │       ├── entities/
│   │   │       │   └── player-skills.entity.ts
│   │   │       └── dto/
│   │   │           ├── create-player-skills.dto.ts
│   │   │           └── update-player-skills.dto.ts
│   │   │
│   │   ├── migrations/
│   │   │   └── 1700000000000-CreatePlayerSkills.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   ├── matches.e2e-spec.ts
│   │   └── players.e2e-spec.ts
│   │
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   ├── ErrorMessage.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   │
│   │   │   ├── matches/
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   ├── MatchCard.test.tsx
│   │   │   │   ├── MatchList.tsx
│   │   │   │   ├── LineupTab.tsx
│   │   │   │   ├── EventsTab.tsx
│   │   │   │   └── EventTimeline.tsx
│   │   │   │
│   │   │   ├── players/
│   │   │   │   ├── PlayerCard.tsx
│   │   │   │   ├── PlayerHeader.tsx
│   │   │   │   ├── SkillRadar.tsx
│   │   │   │   ├── SkillRadar.test.tsx
│   │   │   │   └── MatchHistory.tsx
│   │   │   │
│   │   │   ├── video/
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   └── VideoControls.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Footer.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── MatchesPage.tsx
│   │   │   ├── MatchDetailsPage.tsx
│   │   │   └── PlayerPage.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useMatches.ts
│   │   │   ├── useMatches.test.ts
│   │   │   ├── useMatchDetails.ts
│   │   │   ├── usePlayerSkills.ts
│   │   │   └── useUpdatePlayerSkills.ts
│   │   │
│   │   ├── stores/
│   │   │   └── useAppStore.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── queries.ts
│   │   │
│   │   ├── types/
│   │   │   ├── match.types.ts
│   │   │   ├── player.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   │
│   ├── __tests__/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── .eslintrc.cjs
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── jest.config.js
│   ├── setupTests.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── SETUP.md