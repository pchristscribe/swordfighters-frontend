# Swordfighters Admin Panel with WebAuthn Authentication

## Overview

Your admin panel now uses **WebAuthn** for passwordless authentication with hardware security keys and biometric authentication. This provides military-grade security similar to GPG keys, but designed for web browsers.

## What is WebAuthn?

WebAuthn (Web Authentication) is a web standard for secure, phishing-resistant authentication using:
- **Hardware security keys** (YubiKey, Titan Key, etc.)
- **Platform authenticators** (Touch ID, Face ID, Windows Hello, Android biometrics)
- **Public-key cryptography** (like GPG/SSH keys)

## Architecture

### Backend (`backend/`)
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Session Management**: Redis-backed sessions
- **WebAuthn Library**: @simplewebauthn/server

### Admin Frontend (`admin-frontend/`)
- **Framework**: Nuxt 3 (Vue 3 + SSR)
- **Styling**: Tailwind CSS
- **WebAuthn Library**: @simplewebauthn/browser
- **Port**: 3002 (http://localhost:3002)

## Quick Start

### 1. Start Infrastructure Services

```bash
# From project root
docker-compose up -d
```

This starts PostgreSQL and Redis.

### 2. Start Backend API

```bash
cd backend
npm install
npm run dev
```

Backend runs on **http://localhost:3001**

### 3. Start Admin Frontend

```bash
cd admin-frontend
npm install
npm run dev
```

Admin panel runs on **http://localhost:3002**

### 4. Register Your First Security Key

1. Open **http://localhost:3002** in your browser
2. Click **"Register Security Key"**
3. Enter your email (e.g., `admin@swordfighters.com`)
4. Enter a device name (optional, e.g., "YubiKey 5" or "MacBook Touch ID")
5. Click **"Register Security Key"**
6. Follow your browser's prompt to authenticate:
   - **YubiKey/Security Key**: Insert and tap the key
   - **Touch ID**: Touch the sensor
   - **Face ID**: Look at the camera
   - **Windows Hello**: Use fingerprint/face/PIN

### 5. Login

1. Enter your email
2. Click **"Sign in with Security Key"**
3. Authenticate with your registered device

## Supported Authenticators

✅ **Hardware Security Keys**
- YubiKey (5 Series, Security Key, Bio)
- Google Titan Key
- Any FIDO2-compliant security key

✅ **Platform Authenticators**
- **macOS**: Touch ID (Safari, Chrome, Edge)
- **iOS**: Face ID / Touch ID (Safari)
- **Windows**: Windows Hello (Chrome, Edge)
- **Android**: Fingerprint / Face (Chrome)

## Security Features

### 1. **Phishing-Resistant**
Credentials are cryptographically bound to your domain (`localhost` in dev, your domain in production). Cannot be used on fake sites.

### 2. **Replay Protection**
Uses signature counters to prevent replay attacks.

### 3. **Multiple Keys**
Each admin can register multiple security keys for redundancy:
```
✓ YubiKey (primary)
✓ MacBook Touch ID (backup)
✓ iPhone Face ID (mobile access)
```

### 4. **Session Management**
- Sessions stored in Redis
- 7-day expiration
- Secure, HTTP-only cookies
- CSRF protection

## API Endpoints

### WebAuthn Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/webauthn/register/options` | POST | Get registration challenge |
| `/api/admin/webauthn/register/verify` | POST | Complete registration |
| `/api/admin/webauthn/authenticate/options` | POST | Get login challenge |
| `/api/admin/webauthn/authenticate/verify` | POST | Complete login |
| `/api/admin/webauthn/credentials` | GET | List registered keys |
| `/api/admin/webauthn/credentials/:id` | DELETE | Remove a key |

### Admin CRUD APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/products` | GET | List products (with filters, pagination) |
| `/api/admin/products/:id` | GET | Get single product |
| `/api/admin/products` | POST | Create product |
| `/api/admin/products/:id` | PATCH | Update product |
| `/api/admin/products/:id` | DELETE | Delete product |
| `/api/admin/products/bulk/status` | POST | Bulk update status |
| `/api/admin/products/bulk/delete` | POST | Bulk delete |
| `/api/admin/products/stats/dashboard` | GET | Dashboard statistics |
| `/api/admin/categories` | GET/POST | Manage categories |
| `/api/admin/reviews` | GET/POST | Manage reviews |

## Database Schema

### Admin Model
```prisma
model Admin {
  id                   String              @id @default(cuid())
  email                String              @unique
  passwordHash         String?             // Optional (WebAuthn-only auth)
  name                 String
  role                 String              @default("admin")
  isActive             Boolean             @default(true)
  lastLoginAt          DateTime?
  currentChallenge     String?             // Active WebAuthn challenge
  webauthnCredentials  WebAuthnCredential[]
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
}
```

### WebAuthnCredential Model
```prisma
model WebAuthnCredential {
  id                String   @id @default(cuid())
  adminId           String
  admin             Admin    @relation(fields: [adminId], references: [id])
  credentialId      String   @unique
  publicKey         String   // Stored securely
  counter           BigInt   // For replay protection
  deviceName        String?  // User-friendly name
  transports        String[] // usb, nfc, ble, internal
  lastUsedAt        DateTime?
  createdAt         DateTime @default(now())
}
```

## Production Deployment

### Environment Variables

Add to `.env`:

```bash
# Production Domain Settings
RP_ID=swordfighters.com
ADMIN_URL=https://admin.swordfighters.com
FRONTEND_URL=https://swordfighters.com

# Session Security
SESSION_SECRET=<generate-a-strong-64-character-secret>

# HTTPS will be enforced automatically in production
NODE_ENV=production
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET` (64+ characters)
- [ ] Set correct `RP_ID` (your domain)
- [ ] Set `ADMIN_URL` to your admin domain (HTTPS)
- [ ] Deploy backend to Railway/Render
- [ ] Deploy admin-frontend to Vercel
- [ ] Configure CORS to allow admin domain
- [ ] Test WebAuthn on production domain

## Managing Security Keys

### Add Additional Keys (Recommended)

For redundancy, register multiple authenticators:

1. Login to admin panel
2. Go to Settings (future feature)
3. Click "Add Security Key"
4. Register your backup device

### Remove Lost/Stolen Keys

If a key is lost:

1. Login with another registered key
2. Go to Settings
3. Remove the compromised key
4. The system prevents deleting your last key

## Troubleshooting

### "No security keys registered"
- You need to register a key first using the "Register Security Key" button

### "WebAuthn not supported"
- Update your browser (Chrome 67+, Safari 13+, Edge 18+)
- HTTPS is required in production (localhost works in dev)

### "Invalid authentication session"
- Clear cookies and try again
- Check that Redis is running

### Security key not detected
- **YubiKey**: Insert USB and tap the button
- **Touch ID**: Make sure fingerprints are enrolled in System Preferences
- **Windows Hello**: Enable in Windows Settings

## Browser Compatibility

| Browser | Platform | Support |
|---------|----------|---------|
| Chrome | All platforms | ✅ Full |
| Edge | Windows, macOS | ✅ Full |
| Safari | macOS, iOS | ✅ Full (13+) |
| Firefox | All platforms | ✅ Full |

## Next Steps

1. ✅ Test WebAuthn registration and login
2. ✅ Create your first product via admin API
3. ✅ Explore the dashboard
4. [ ] Build product CRUD forms
5. [ ] Add category management
6. [ ] Implement review moderation
7. [ ] Set up production deployment

## Support

For WebAuthn issues, see: https://webauthn.guide/
For SimpleWebAuthn docs: https://simplewebauthn.dev/

---

**🔐 Your admin panel is now secured with military-grade cryptographic authentication!**
