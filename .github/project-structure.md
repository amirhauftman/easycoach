easycoach/
├── .github/
│   ├── copilot-instructions.md      # Main Copilot instructions
│   ├── PRD.md                       # Product Requirements Document
│   ├── backend-architecture.md      # Backend architecture instructions
│   ├── project-instruction.md       # Project instructions
│   ├── project-structure.md         # This file - project structure
│   └── test-instruction.md          # Testing instructions
│
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   └── filters/
│   │   │       └── all-exceptions.filter.ts
│   │   │
│   │   ├── config/
│   │   │   ├── configuration.ts
│   │   │   └── typeorm.config.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.module.ts
│   │   │   │
│   │   │   ├── matches/
│   │   │   │   ├── matches.module.ts
│   │   │   │   ├── matches.controller.ts
│   │   │   │   ├── matches.service.ts
│   │   │   │   ├── easycoach-api.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-match.dto.ts
│   │   │   │   │   └── update-match.dto.ts
│   │   │   │   └── entities/
│   │   │   │       ├── match.entity.ts
│   │   │   │       └── match-event.entity.ts
│   │   │   │
│   │   │   └── players/
│   │   │       ├── players.module.ts
│   │   │       ├── players.controller.ts
│   │   │       ├── players.service.ts
│   │   │       ├── easycoach-players-api.service.ts
│   │   │       └── entities/
│   │   │           ├── player.entity.ts
│   │   │           └── player-stat.entity.ts
│   │   │
│   │   ├── migrations/
│   │   │   └── README.md
│   │   │
│   │   ├── app.controller.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── data-source.ts
│   │   └── main.ts
│   │
│   ├── scripts/
│   │   ├── enrich-matches.ts
│   │   └── seed-matches.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── .env
│   ├── .gitignore
│   ├── .prettierrc
│   ├── BEST_PRACTICES_SUMMARY.md
│   ├── CHECKLIST.md
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.build.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   ├── data/
│   │   │   ├── match-1061429.json
│   │   │   └── matches.json
│   │   └── breakdown_game_1061429_league_726.json
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── Breadcrumb.css
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── ErrorMessage.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Toast.css
│   │   │   │   └── ToastContainer.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Header.css
│   │   │   │
│   │   │   ├── matches/
│   │   │   │   ├── EventsTab.tsx
│   │   │   │   ├── EventTimeline.tsx
│   │   │   │   ├── LineupTab.tsx
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   ├── MatchList.tsx
│   │   │   │   └── TeamLineup.tsx
│   │   │   │
│   │   │   ├── players/
│   │   │   │   ├── MatchesList.tsx
│   │   │   │   ├── MatchesList.css
│   │   │   │   ├── MatchHistory.tsx
│   │   │   │   ├── PlayerCard.tsx
│   │   │   │   ├── PlayerHeader.tsx
│   │   │   │   ├── SkillRadar.tsx
│   │   │   │   └── __tests__/
│   │   │   │       ├── MatchesList.test.tsx
│   │   │   │       ├── PlayerHeader.test.tsx
│   │   │   │       └── SkillRadar.test.tsx
│   │   │   │
│   │   │   └── video/
│   │   │       ├── MatchEventPlayer.tsx
│   │   │       ├── MatchPlayer.tsx
│   │   │       ├── VideoControls.tsx
│   │   │       └── VideoPlayer.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useMatchDetail.ts
│   │   │   ├── useQueries.ts
│   │   │   ├── useToast.ts
│   │   │   └── USAGE_EXAMPLES.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── MatchDetail.tsx
│   │   │   ├── MatchesPage.tsx
│   │   │   ├── PlayerDetail.tsx
│   │   │   ├── PlayerDetail.css
│   │   │   └── VideoPage.tsx
│   │   │
│   │   ├── services/
│   │   │   └── easycoach-api.ts
│   │   │
│   │   ├── stores/
│   │   │   └── useAppStore.ts
│   │   │
│   │   ├── test/
│   │   │   └── setup.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── setupTests.ts
│   │   └── types.ts
│   │
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── FRONTEND_IMPROVEMENTS.md
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── .env
├── .env.docker
├── .gitignore
├── breakdown_game_1061429_league_726.json
└── README.md