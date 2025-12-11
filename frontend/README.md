# Swordfighters User Frontend

User-facing product catalog for the Swordfighters affiliate marketing platform.

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + SSR)
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Testing**: Vitest + Vue Test Utils

## Setup

Install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Testing

Run tests:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Visual test UI
npm run test:coverage # Coverage report
```

See [../TEST_COVERAGE_SUMMARY.md](../TEST_COVERAGE_SUMMARY.md) for comprehensive test documentation.

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Project Documentation

- **[Root README](../README.md)** - Project overview and structure
- **[CLAUDE.md](../CLAUDE.md)** - Development guidelines
- **[TEST_COVERAGE_SUMMARY.md](../TEST_COVERAGE_SUMMARY.md)** - Test coverage details

## Resources

- [Nuxt 4 Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment)
- [Vitest Documentation](https://vitest.dev/)
