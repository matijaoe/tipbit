# Tipbit Development Guide

## Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production 
- `pnpm lint` / `pnpm lint:fix` - ESLint
- `vitest` - Run tests (no configured test command)
- `pnpm db:push` - Push schema to database
- `pnpm db:seed` - Seed database
- `pnpm studio` - Launch Drizzle Studio

## Architecture
**Nuxt 3** app with **TypeScript**, **SQLite + Drizzle ORM**, **Tailwind + shadcn-vue**, **nuxt-auth-utils**, dual-layer encryption (libsodium). Structure: `app/` (frontend), `server/` (API), `shared/` (common code). Payment system uses adapter pattern in `shared/providers/`.

## Code Style
- **Prettier**: 120 chars, single quotes, no semis, 2 spaces
- **ESLint**: Nuxt config, `vue/html-self-closing` off, `@typescript-eslint/no-explicit-any` warn
- Use `const`, arrow functions, `type` over `interface`, Composition API
- Auto-imports: composables, stores, utilities from `shared/utils/`

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main AGENT.md file.**
@./.taskmaster/AGENT.md
