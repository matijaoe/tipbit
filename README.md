# Tipbit - Bitcoin Lightning Network Tipping Platform

A simple, privacy-focused Bitcoin tipping platform leveraging the Lightning Network.

## Features

- **Frictionless Bitcoin tipping** via Lightning Network (using Strike, Coinos, Alby APIs)
- **Multiple user profiles** per account, each with customizable payment methods
- **Privacy-first**: anonymous tipping by default, optional profile-sharing
- **Secure API key management**: All API keys are encrypted in the database

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

### Security Setup

Before running the application, you need to generate an encryption key for securing sensitive data:

```bash
# Generate an encryption key
pnpm security:generate-key

# Add the generated key to your .env file
# NUXT_ENCRYPTION_KEY=your-generated-key
```

See the [security documentation](./docs/security.md) for more information.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Tech Stack

- **Frontend:** Nuxt 3 (TypeScript, Vue Composition API), Tailwind CSS, shadcn-vue components
- **Backend:** Nuxt server routes, Nitro endpoints, TypeScript
- **Database:** SQLite with Drizzle ORM
- **Authentication:** OAuth (GitHub, Google, X, Twitch)
- **Security:** libsodium for encryption of sensitive data

Check out the [documentation](./docs) for more information.
