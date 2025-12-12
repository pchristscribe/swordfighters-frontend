# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swordfighters App is an affiliate marketing platform targeting gay men, curating products from DHgate, AliExpress, Amazon, and Wish. The app will feature:
- Product reviews and seasonal recommendations
- Targeted drop shipping on DHgate for group orders
- FTC-compliant disclosure of affiliate relationships and monetary considerations

## Current Repository Structure

This repository contains two Nuxt 4 frontends and infrastructure configuration:

```
ProjectXY/
├── admin-frontend/        # Admin panel with WebAuthn authentication (Port 3002)
├── frontend/             # User-facing product catalog (Port 3000)
├── backend/              # Backend API (external service - deployed separately)
├── mcp-dhgate/           # DHgate MCP server for product scraping
└── docker-compose.yml    # PostgreSQL + Redis infrastructure
```

**Note**: The backend API is deployed as an external service and is not actively developed in this repository.

## Tech Stack

### Admin Frontend (`admin-frontend/`)
- Framework: Nuxt 4 (Vue 3 + SSR)
- Styling: Tailwind CSS
- State Management: Pinia
- Authentication: WebAuthn (passwordless with security keys)
- Testing: Vitest + Vue Test Utils + happy-dom

### User Frontend (`frontend/`)
- Framework: Nuxt 4 (Vue 3 + SSR)
- Styling: Tailwind CSS
- State Management: Pinia
- Testing: Vitest + Vue Test Utils + happy-dom

### Backend API (External Service)
- Runtime: Node.js 20+
- Framework: Fastify
- Database: PostgreSQL with Prisma ORM
- Task Queue: Bull (Redis-backed for scraping/sync jobs)
- Caching: Redis (product data, affiliate link tracking)
- Affiliate Link Tracking: Dub + custom layer

### Development Environment
- Docker Compose for local development (PostgreSQL, Redis)
- Ensures consistency between dev and production environments

### Production Deployment
- Admin Frontend: Vercel (Nuxt optimized)
- User Frontend: Vercel (Nuxt optimized)
- Backend: Railway or Render (external service)
- Database: Supabase (PostgreSQL)
- Scraping Jobs: GitHub Actions + Bull queue
- Monitoring: Sentry

## Development Setup

### Initial Setup
1. Copy `.env.example` to `.env` and update values as needed
2. Start infrastructure services:
   ```bash
   docker-compose up -d
   ```
3. Check service health:
   ```bash
   docker-compose ps
   ```

### Frontend Development

**Admin Panel (http://localhost:3002)**:
```bash
cd admin-frontend
npm install
npm run dev
```

**User Frontend (http://localhost:3000)**:
```bash
cd frontend
npm install
npm run dev
```

### Running Tests

**Admin Frontend Tests**:
```bash
cd admin-frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**User Frontend Tests**:
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

See [TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md) for detailed test documentation.

### Common Docker Commands
- Start services: `docker-compose up -d`
- Stop services: `docker-compose down`
- View logs: `docker-compose logs -f [service_name]`
- Restart services: `docker-compose restart`
- Remove volumes (⚠️ deletes data): `docker-compose down -v`

### Database Management
- Access PostgreSQL: `docker exec -it swordfighters-postgres psql -U swordfighters -d swordfighters_db`
- Access Redis CLI: `docker exec -it swordfighters-redis redis-cli -a dev_redis_password`

## Testing & Quality Assurance

### Test Coverage
The project includes comprehensive validation testing across all layers:
- **66 Tests Created**: WebAuthn authentication, input validation, frontend stores
- **52 Security Bugs Identified**: Documented in VALIDATION_BUGS_FOUND.md
- **95% Critical Path Coverage**: All major authentication flows tested

### Key Test Files
- `admin-frontend/tests/auth.test.ts` - WebAuthn authentication validation (30+ tests)
- `frontend/tests/stores.test.ts` - Frontend store testing
- `frontend/tests/types.test.ts` - Type safety validation

### Testing Requirements
All new features must include:
- ✅ Vitest tests with >80% coverage
- ✅ Input validation tests for all user inputs
- ✅ Error handling tests for API calls
- ✅ SSR safety checks (no browser-only code in SSR)

### Documentation
- **[TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md)** - Comprehensive test metrics and results
- **[VALIDATION_BUGS_FOUND.md](./VALIDATION_BUGS_FOUND.md)** - Security vulnerabilities identified by tests

## Legal Compliance

All affiliate links and sponsored content must include FTC-compliant disclosures indicating that the site receives monetary compensation from affiliate programs.

## Code Style Rules

### Code Formatting

- No semicolons (enforced)
- Single quotes (enforced)
- No unnecessary curly braces (enforced)
- 2-space indentation
- Import order: external → internal → types