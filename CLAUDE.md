# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Operations
```bash
pnpm db:push        # Push schema changes to database
pnpm db:generate    # Generate new migrations
pnpm db:migrate     # Run pending migrations
pnpm db:seed        # Seed database with initial data
pnpm studio         # Launch Drizzle Studio (database GUI)
pnpm db:reset       # Reset database (destructive)
```

### Security Key Management
```bash
pnpm keygen:transit   # Generate client-server encryption keys
pnpm keygen:storage   # Generate storage encryption key
pnpm keygen:auth      # Generate session authentication key
```

### Code Quality
```bash
pnpm lint           # Run ESLint
pnpm lint:fix       # Run ESLint with auto-fix
pnpm typecheck      # Run TypeScript checks
vitest              # Run tests with Vitest
pnpm dev            # Start development server
pnpm build          # Build for production
```

## Architecture Overview

### Core Technology Stack
- **Nuxt 3** with TypeScript and Vue Composition API
- **SQLite** with **Drizzle ORM** for database operations
- **Tailwind CSS** + **shadcn-vue** for UI components
- **nuxt-auth-utils** for authentication
- **libsodium** for cryptographic operations

### Security Architecture
**Dual-Layer Encryption System:**
1. **Transit encryption**: Asymmetric (`crypto_box_seal`) for client-server communication
2. **Storage encryption**: Symmetric (`crypto_secretbox`) for database persistence

All sensitive data (API keys, credentials) uses this dual-layer approach. Keys are generated using dedicated scripts and stored in environment variables.

### Database Schema Patterns
- **Single user entity** (username-based routing via `/[username]`)
- **Payment connections** with service-specific child tables (Strike, Coinos, Alby)
- **User preferences** for payment service prioritization
- **WebAuthn credentials** for passkey authentication

Database changes require migrations via `pnpm db:generate` and `pnpm db:migrate`.

### Payment System Architecture
Uses **adapter pattern** with `PaymentAdapter` interface:
- Service-specific adapters in `shared/providers/`
- Unified `Invoice` type across all services
- Encrypted API key storage with priority-based selection
- Connection management via parent-child table relationships

### File Structure Patterns
- `app/` - Frontend (pages, components, composables)
- `server/` - Backend API routes and utilities
- `shared/` - Code shared between frontend/backend
- Domain-driven organization in `shared/` folder

### Authentication Flow
1. **OAuth providers** (GitHub, Google, X, Twitch) for initial signup
2. **WebAuthn/Passkeys** for passwordless authentication
3. **Account linking** - multiple OAuth providers per user
4. **Session management** with encrypted cookies

### Component Development
- Use **shadcn-vue** components from `app/components/ui/`
- Follow **Composition API** patterns
- Auto-imports available for composables and utilities
- Type-safe props with TypeScript
- Use `const` for variables, arrow functions over function declarations
- Prefer `type` over `interface` for TypeScript definitions

### API Development
- Server routes in `server/api/` with Nitro
- Use **Zod** for input validation
- **H3** utilities for request handling
- Encrypted data handling for sensitive operations

### Testing
- **Vitest** with Nuxt environment
- Database tests use separate test database
- Security functions have dedicated test files

## Requirements
- **Node.js**: Version 22.x (specified in package.json engines)

## Environment Variables
Required for development:
- `NUXT_AUTH_TRANSIT_PUBLIC_KEY` / `NUXT_AUTH_TRANSIT_PRIVATE_KEY`
- `NUXT_AUTH_STORAGE_KEY`
- `NUXT_SESSION_PASSWORD`
- OAuth provider credentials (GitHub, Google, etc.)

Generate missing keys using the `pnpm keygen:*` commands.

## Development Notes
- Database schema changes require migration generation
- Payment provider integrations follow the adapter pattern
- All sensitive data must use the dual-layer encryption system
- WebAuthn is configured for localhost development
- Public profiles accessible via `/[username]` routes
