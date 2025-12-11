# Swordfighters Admin Panel

WebAuthn-secured admin panel for managing the Swordfighters affiliate marketing platform.

## Features

- 🔐 **WebAuthn Authentication**: Passwordless login with hardware security keys (YubiKey, Touch ID, Face ID)
- 🛡️ **Phishing-Resistant**: Cryptographic authentication bound to your domain
- 📊 **Product Management**: CRUD operations for products, categories, and reviews
- 🔒 **Session Security**: Redis-backed sessions with secure cookies
- ✅ **Comprehensive Testing**: 30+ validation tests for authentication flows

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + SSR)
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Authentication**: @simplewebauthn/browser
- **Testing**: Vitest + Vue Test Utils + happy-dom

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL and Redis running (via `docker-compose up -d` from project root)
- Backend API service running

### Development

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3002
npm run dev
```

### First Time Setup

1. Open http://localhost:3002
2. Click "Register Security Key"
3. Enter your email and device name
4. Authenticate with your security key/biometric
5. Login with your registered device

## Testing

Run the comprehensive test suite:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Visual test UI
npm run test:coverage # Coverage report
```

### Test Coverage

- **30+ Tests**: Authentication flows, input validation, error handling
- **95% Coverage**: All critical WebAuthn paths tested
- **Security Testing**: Input sanitization, type coercion, SSR safety

See [../TEST_COVERAGE_SUMMARY.md](../TEST_COVERAGE_SUMMARY.md) for detailed test metrics.

## Supported Authenticators

✅ **Hardware Security Keys**
- YubiKey (5 Series, Security Key, Bio)
- Google Titan Key
- Any FIDO2-compliant security key

✅ **Platform Authenticators**
- macOS: Touch ID (Safari, Chrome, Edge)
- iOS: Face ID / Touch ID (Safari)
- Windows: Windows Hello (Chrome, Edge)
- Android: Fingerprint / Face (Chrome)

## Project Structure

```
admin-frontend/
├── app/
│   ├── components/        # Vue components
│   ├── layouts/          # Nuxt layouts
│   ├── pages/            # Route pages
│   ├── stores/           # Pinia stores
│   └── app.vue           # Root component
├── tests/
│   └── auth.test.ts      # WebAuthn authentication tests
├── nuxt.config.ts        # Nuxt configuration
├── vitest.config.ts      # Test configuration
└── package.json          # Dependencies and scripts
```

## API Integration

The admin panel communicates with the backend API for:
- WebAuthn registration and authentication
- Product, category, and review management
- Session management

Backend API must be running on the configured endpoint (default: http://localhost:3001).

## Production Deployment

### Environment Variables

```bash
# Production configuration
NODE_ENV=production
NUXT_PUBLIC_API_URL=https://api.swordfighters.com
```

### Deployment

Deploy to Vercel (recommended):

```bash
npm run build
vercel deploy
```

See [../ADMIN_PANEL_SETUP.md](../ADMIN_PANEL_SETUP.md) for complete production deployment guide.

## Security Features

1. **WebAuthn Authentication**: Passwordless, phishing-resistant authentication
2. **Public Key Cryptography**: Same security model as SSH/GPG keys
3. **Replay Protection**: Signature counters prevent credential replay
4. **Domain Binding**: Credentials only work on registered domain
5. **Multiple Keys**: Register backup devices for redundancy

## Known Issues

See [../VALIDATION_BUGS_FOUND.md](../VALIDATION_BUGS_FOUND.md) for documented security vulnerabilities and planned fixes.

## Documentation

- **[ADMIN_PANEL_SETUP.md](../ADMIN_PANEL_SETUP.md)** - Complete setup and usage guide
- **[TEST_COVERAGE_SUMMARY.md](../TEST_COVERAGE_SUMMARY.md)** - Test coverage metrics
- **[VALIDATION_BUGS_FOUND.md](../VALIDATION_BUGS_FOUND.md)** - Security audit results
- **[CLAUDE.md](../CLAUDE.md)** - Development guidelines

## Resources

- [WebAuthn Guide](https://webauthn.guide/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vitest Documentation](https://vitest.dev/)

## Troubleshooting

### "No security keys registered"
You need to register a key first using the "Register Security Key" button.

### "WebAuthn not supported"
- Update your browser (Chrome 67+, Safari 13+, Edge 18+)
- HTTPS is required in production (localhost works in dev)

### Security key not detected
- **YubiKey**: Insert USB and tap the button
- **Touch ID**: Ensure fingerprints are enrolled in System Preferences
- **Windows Hello**: Enable in Windows Settings

---

**🔐 Secured with military-grade cryptographic authentication**
