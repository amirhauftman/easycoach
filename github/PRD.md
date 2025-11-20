# Product Requirements Document (PRD)
## EasyCoach Sports Analytics Application

**Version:** 1.0  
**Date:** November 2024  
**Author:** Development Team

---

## 1. Executive Summary

Build a web application that integrates with the EasyCoach API to provide coaches and scouts with match analysis, player statistics, and video playback capabilities.

### Goals
- Enable coaches to quickly find and analyze matches
- Provide scouts with detailed player performance data
- Integrate video playback with match events

### Success Metrics
- Load match list in <2 seconds
- Video event seeking accuracy within 5 seconds
- 100% API integration coverage
- Zero critical bugs in production

---

## 2. User Personas

### Coach (Primary User)
- **Needs:** Quick access to match footage, team lineups, event timeline
- **Pain Points:** Scattered data sources, manual video seeking
- **Goals:** Analyze team performance, prepare for next match

### Scout (Secondary User)
- **Needs:** Player statistics, skill comparisons, match history
- **Pain Points:** Lack of standardized player metrics
- **Goals:** Identify talent, compare players objectively

---

## 3. Functional Requirements

### 3.1 Match List Page (`/matches`)

**Priority:** P0 (Must Have)

**User Story:**  
As a coach, I want to see all matches grouped by date so I can quickly find specific games.

**Acceptance Criteria:**
- ✓ Matches fetched from EasyCoach API
- ✓ Grouped by match day (YYYY-MM-DD format)
- ✓ Each match shows: home team, away team, score, kickoff time, competition
- ✓ Fake team logos generated using UI Avatars
- ✓ Click match to navigate to details page
- ✓ Loading state while fetching data
- ✓ Error handling for API failures

**API Endpoint:**
```
GET https://ifa.easycoach.club/en/api/v3/analytics/league
?league_id=726&season_id=26&user_token={TOKEN}
```

**Wireframe:**
```
┌─────────────────────────────────────┐
│  Match Day: 2025-10-25             │
├─────────────────────────────────────┤
│  [Logo] Team A  2 - 4  Team B [Logo]│
│  Competition: U17 League            │
│  Kickoff: 10:00 AM                  │
├─────────────────────────────────────┤
│  Match Day: 2025-10-26             │
│  ...                                │
└─────────────────────────────────────┘
```

---

### 3.2 Match Details Page (`/matches/:matchId`)

**Priority:** P0 (Must Have)

**User Story:**  
As a coach, I want to see match video, lineups, and events so I can analyze the game comprehensively.

**Acceptance Criteria:**
- ✓ Video player at top (if pixellot_id exists)
- ✓ Two tabs: Lineups and Events
- ✓ Lineups show Starting 11 and Substitutes for both teams
- ✓ Events show goals and yellow/red cards
- ✓ Clicking event seeks video to that timestamp
- ✓ Player names clickable to navigate to player page

**API Endpoint:**
```
GET https://ifa.easycoach.club/en/api/v3/analytics/match
?match_id={MATCH_ID}&user_token={TOKEN}
```

**Components:**

#### Video Player
- Embed Pixellot player if `pixellot_id` exists
- Show placeholder if no video
- Control playback from event timeline

#### Lineups Tab
```
┌────────────────┬────────────────┐
│   HOME TEAM    │   AWAY TEAM    │
├────────────────┼────────────────┤
│ Starting 11    │ Starting 11    │
│ #1 GK Player1  │ #1 GK Player6  │
│ #2 DEF Player2 │ #2 DEF Player7 │
│ ...            │ ...            │
├────────────────┼────────────────┤
│ Substitutes    │ Substitutes    │
│ #12 MID Player │ #12 FWD Player │
└────────────────┴────────────────┘
```

#### Events Tab
- Table format: Minute | Player | Event Type | Action
- Event types: Goal, Yellow Card, Red Card
- Click event → video seeks to timestamp
- If no timestamp, calculate as `minute * 60`

---

### 3.3 Player Page (`/players/:playerId`)

**Priority:** P0 (Must Have)

**User Story:**  
As a scout, I want to see player skills visualized and compare them to averages so I can evaluate talent objectively.

**Acceptance Criteria:**
- ✓ Player header with avatar (UI Avatars), name, position, team, DOB
- ✓ Editable skill radar chart (6 attributes)
- ✓ Comparison overlay (player vs position average)
- ✓ Match history table
- ✓ Skills persist in database
- ✓ Real-time radar chart updates

**Skill Attributes:**
1. Passing (1-10)
2. Dribbling (1-10)
3. Speed (1-10)
4. Defending (1-10)
5. Physical (1-10)
6. Potential (1-10)

**Default Average Values:**
- Passing: 6
- Dribbling: 5
- Speed: 7
- Defending: 5
- Physical: 6
- Potential: 6

**Database Schema:**
```sql
CREATE TABLE player_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id VARCHAR(50) NOT NULL UNIQUE,
  passing INT CHECK (passing BETWEEN 1 AND 10),
  dribbling INT CHECK (dribbling BETWEEN 1 AND 10),
  speed INT CHECK (speed BETWEEN 1 AND 10),
  defending INT CHECK (defending BETWEEN 1 AND 10),
  physical INT CHECK (physical BETWEEN 1 AND 10),
  potential INT CHECK (potential BETWEEN 1 AND 10),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Page Load:** <3 seconds on 3G connection
- **API Response:** Cache for 5 minutes
- **Video Seeking:** <1 second delay
- **Radar Chart Update:** Real-time (<100ms)

### 4.2 Scalability
- Support 1000+ matches
- Support 500+ concurrent users (future)
- Database optimized for <100ms queries

### 4.3 Security
- API token stored in environment variables
- Input validation on all forms
- SQL injection prevention (TypeORM)
- XSS protection (React default)

### 4.4 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 4.5 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios >4.5:1

---

## 5. Technical Architecture

### 5.1 System Architecture
```
┌─────────────┐      HTTP      ┌─────────────┐
│   React     │ ────────────► │   NestJS    │
│  Frontend   │ ◄──────────── │   Backend   │
└─────────────┘    REST API    └─────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │    MySQL    │
                               │  Database   │
                               └─────────────┘
                                      ▲
                                      │
                               ┌─────────────┐
                               │ EasyCoach   │
                               │     API     │
                               └─────────────┘
```

### 5.2 Data Flow
1. User requests match list
2. Backend checks cache
3. If cache miss, fetch from EasyCoach API
4. Transform and cache response
5. Return to frontend
6. Frontend renders with TanStack Query

### 5.3 Caching Strategy
- **Match List:** 5 minutes TTL
- **Match Details:** 10 minutes TTL
- **Player Skills:** No cache (user input)
- **Cache Invalidation:** Manual + automatic expiry

---

## 6. API Specifications

### 6.1 Backend Endpoints

#### GET `/api/matches`
Fetch all matches grouped by match day.

**Response:**
```json
{
  "2025-10-25": [
    {
      "id": "957759",
      "homeTeam": "Hapoel Ra'anana U17",
      "awayTeam": "Maccabi Petah Tikva U17",
      "homeScore": 2,
      "awayScore": 4,
      "kickoff": "2025-10-25T10:00:00Z",
      "competition": "U17 League"
    }
  ]
}
```

#### GET `/api/matches/:matchId`
Fetch detailed match information.

**Response:**
```json
{
  "id": "957759",
  "homeTeam": { "id": "2234", "name": "Hapoel Ra'anana U17" },
  "awayTeam": { "id": "1598", "name": "Maccabi Petah Tikva U17" },
  "homeScore": 2,
  "awayScore": 4,
  "pixellotId": "abc123",
  "homeLineup": [...],
  "awayLineup": [...],
  "events": [...]
}
```

#### GET `/api/players/:playerId`
Fetch player details and skills.

#### PUT `/api/players/:playerId/skills`
Update player skills.

**Request Body:**
```json
{
  "passing": 8,
  "dribbling": 7,
  "speed": 9,
  "defending": 4,
  "physical": 7,
  "potential": 8
}
```

---

## 7. Testing Requirements

### 7.1 Unit Tests
- All service methods
- Utility functions
- React hooks
- **Target Coverage:** 80%

### 7.2 Integration Tests
- API endpoints with test database
- Cache functionality
- External API mocking

### 7.3 E2E Tests
- Match list navigation
- Match details viewing
- Player skill editing
- Video event seeking

---

## 8. Deployment

### 8.1 Development Environment
```bash
docker-compose up
```

### 8.2 Production Build
```bash
docker build -t easycoach-frontend ./frontend
docker build -t easycoach-backend ./backend
```

### 8.3 Environment Variables
See `.env.example` for required variables.

---

## 9. Future Enhancements (Out of Scope for v1.0)

- **P1:** Multi-language support (Hebrew, English)
- **P2:** Real-time match updates via WebSocket
- **P3:** Advanced player comparisons (multiple players)
- **P4:** Custom team formations visualization
- **P5:** Export reports as PDF
- **P6:** Mobile native applications
- **P7:** AI-powered match insights

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| EasyCoach API downtime | High | Implement caching, show cached data |
| Slow video loading | Medium | Add loading states, optimize CDN |
| Browser compatibility | Low | Use polyfills, test on all browsers |
| Database scaling | Medium | Implement indexing, consider read replicas |

---

## 11. Acceptance Criteria Summary

### Definition of Done
- [ ] All P0 features implemented
- [ ] 80%+ test coverage
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Code review approved
- [ ] Documentation complete
- [ ] Docker deployment tested

### Sign-off Required From
- Product Manager
- Technical Lead
- QA Lead

---

**Last Updated:** November 20, 2024  
**Next Review:** After MVP delivery