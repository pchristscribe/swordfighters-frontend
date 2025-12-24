# Swordfighters App

An affiliate marketing platform targeting gay men, curating products from DHgate, AliExpress, Amazon, and Wish.

## Quick Start

```bash
# Start infrastructure (PostgreSQL & Redis)
docker-compose up -d

# Start admin frontend (WebAuthn admin panel)
cd admin-frontend
npm install
npm run dev  # Runs on http://localhost:3002

# Start user frontend (product catalog)
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

## Project Structure

```
ProjectXY/
├── admin-frontend/        # Admin panel with WebAuthn authentication
│   ├── app/              # Nuxt 4 app directory
│   ├── tests/            # Vitest tests for admin features
│   └── vitest.config.ts  # Test configuration
│
├── frontend/             # User-facing product catalog
│   ├── app/              # Nuxt 4 app directory
│   ├── tests/            # Vitest tests for frontend
│   └── vitest.config.ts  # Test configuration
│
├── backend/              # Backend infrastructure (external service)
│   └── node_modules/     # Backend dependencies
│
├── mcp-dhgate/           # DHgate MCP server for product scraping
│
├── docker-compose.yml    # PostgreSQL + Redis infrastructure
│
├── CLAUDE.md             # Project guidance for Claude Code
├── ADMIN_PANEL_SETUP.md  # WebAuthn admin setup guide
├── TEST_COVERAGE_SUMMARY.md      # Comprehensive test documentation
└── VALIDATION_BUGS_FOUND.md      # Security vulnerabilities found by tests
```

## Architecture

### Frontend Stack
- **Framework**: Nuxt 4 (Vue 3 + SSR)
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Testing**: Vitest with Vue Test Utils

### Admin Panel Features
- **WebAuthn Authentication**: Passwordless login with hardware security keys (YubiKey, Touch ID, Face ID)
- **Secure Sessions**: Redis-backed session management
- **Full CRUD Interface**: Complete UI for managing products, categories, and reviews
  - Product management with search, filters, and bulk operations
  - Category management with SEO fields
  - Review moderation with pros/cons lists
  - Form validation and double-submit prevention
  - Responsive design with mobile support

### Infrastructure
- **Database**: PostgreSQL (via Docker)
- **Cache**: Redis (via Docker)
- **Task Queue**: Bull (Redis-backed for scraping jobs)
- **Backend API**: External service (not in this repository)

## Documentation

### Getting Started
- **[ADMIN_PANEL_SETUP.md](./ADMIN_PANEL_SETUP.md)** - Complete WebAuthn setup and admin panel guide
- **[CLAUDE.md](./CLAUDE.md)** - Project instructions for Claude Code

### Testing
- **[TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md)** - Comprehensive test coverage documentation (66 validation tests)
- **[VALIDATION_BUGS_FOUND.md](./VALIDATION_BUGS_FOUND.md)** - Security vulnerabilities identified by test suite (52 bugs documented)

### Development Guides
- **Frontend README**: [frontend/README.md](./frontend/README.md)
- **MCP Server**: [mcp-dhgate/README.md](./mcp-dhgate/README.md)

## Running Tests

```bash
# Admin frontend tests
cd admin-frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report

# User frontend tests
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Development Workflow

### 1. Infrastructure Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

### 3. Frontend Development
```bash
# Admin Panel (http://localhost:3002)
cd admin-frontend
npm install
npm run dev

# User Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

## Testing & Quality Assurance

The project includes comprehensive validation testing:

- **66 Tests Created**: Covering WebAuthn authentication, input validation, and frontend stores
- **52 Bugs Identified**: Security vulnerabilities documented in VALIDATION_BUGS_FOUND.md
- **95% Critical Path Coverage**: All major authentication flows tested

See [TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md) for detailed test metrics.

## Legal Compliance

All affiliate links and sponsored content include FTC-compliant disclosures indicating monetary compensation from affiliate programs.

## Production Deployment

### Frontend Deployments
- **Admin Frontend**: Vercel (Nuxt optimized)
- **User Frontend**: Vercel (Nuxt optimized)

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Backend API**: Railway or Render
- **Scraping Jobs**: GitHub Actions + Bull queue
- **Monitoring**: Sentry

### Environment Variables
See [ADMIN_PANEL_SETUP.md](./ADMIN_PANEL_SETUP.md#production-deployment) for production environment configuration.

## Contributing

### Code Style
- No semicolons
- Single quotes
- No unnecessary curly braces
- 2-space indentation
- Import order: external → internal → types

See [CLAUDE.md](./CLAUDE.md) for detailed code style rules.

### Testing Requirements
All new features require:
- ✅ Vitest tests with >80% coverage
- ✅ Input validation tests for all user inputs
- ✅ Error handling tests for API calls

## Support & Resources

- **WebAuthn Guide**: https://webauthn.guide/
- **SimpleWebAuthn Docs**: https://simplewebauthn.dev/
- **Nuxt 4 Docs**: https://nuxt.com/docs
- **Vitest Docs**: https://vitest.dev/

## Security

This project implements:
- ✅ **WebAuthn passwordless authentication** (phishing-resistant)
- ✅ **Input validation** at all layers
- ✅ **Redis-backed sessions** with secure cookies
- ✅ **Rate limiting** on authentication endpoints
- ⚠️ **Known vulnerabilities** documented in VALIDATION_BUGS_FOUND.md (fixes in progress)

---

**Status**: Active Development
**Test Coverage**: 66 tests, 52 security issues identified and documented
