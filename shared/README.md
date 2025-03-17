# Shared Code

This directory contains code that is shared between the frontend (app) and backend (server). The goal is to maintain a single source of truth for types, constants, and utilities used across the application.

## Directory Structure

```
shared/
├── constants/           # Core constants organized by domain
│   ├── auth.ts          # Auth-related constants (Roles, AuthProviders)
│   ├── routes.ts        # Route constants (RESERVED_ROUTES, PUBLIC_ROUTES)
│   └── index.ts         # Re-exports auth and routes constants only
├── validators/          # Core validation utilities
│   ├── auth.ts          # Auth validation functions (isValidRole, etc.)
│   ├── routes.ts        # Route validation functions (isReservedRoute, etc.)
│   └── index.ts         # Re-exports auth and route validators only
├── payments/            # Unified payment system
│   ├── constants.ts     # Payment-specific constants
│   ├── types.ts         # Payment type definitions
│   ├── validators.ts    # Payment validation utilities
│   ├── adapters.ts      # Provider adapter interfaces
│   └── index.ts         # Re-exports all payment modules
├── providers/           # Provider-specific implementations
│   ├── strike/          # Strike integration
│   │   ├── types.ts     # Strike types
│   │   ├── api.ts       # Strike API client
│   │   ├── adapter.ts   # Strike adapter implementation
│   │   └── index.ts     # Re-exports Strike modules
│   ├── coinos/          # Coinos integration (placeholder)
│   ├── alby/            # Alby integration (placeholder)
│   └── index.ts         # Provider registry and re-exports
├── utils/               # Shared utilities
│   ├── datetime.ts      # Date/time utilities
│   ├── formatting.ts    # Formatting utilities
│   └── index.ts         # Re-exports all utilities
└── index.ts             # Exports core modules (constants, validators, utils)
```

## Import Guidelines

### Recommended Import Paths

Each module should be imported from its specific domain path:

```typescript
// Core system-wide constants
import { Roles, AuthProviders } from '~/shared/constants/auth'
import { RESERVED_ROUTES } from '~/shared/constants/routes'

// Core validators
import { isValidRole } from '~/shared/validators/auth'
import { isReservedRoute } from '~/shared/validators/routes'

// Utils
import { formatDateTime } from '~/shared/utils/datetime'
import { satsToBtc } from '~/shared/utils/formatting'

// Payment system
import { PaymentServiceType } from '~/shared/payments/constants'
import { Invoice } from '~/shared/payments/types'
import { isValidPaymentService } from '~/shared/payments/validators'
import { PaymentAdapter } from '~/shared/payments/adapters'

// Provider implementations
import { StrikeAdapter } from '~/shared/providers/strike'
```

### Shorthand Imports

You can use these shorthand imports for convenience:

```typescript
// Core modules can be imported directly from shared
import { Roles, isValidRole, formatDateTime } from '~/shared'

// Payment modules should be imported from payments 
import { PaymentServiceType, Invoice, isValidPaymentService } from '~/shared/payments'

// Provider-specific code should be imported from the provider
import { StrikeAdapter } from '~/shared/providers/strike'
```

## Best Practices

1. **Domain boundaries**: Respect domain boundaries - no cross-domain re-exports
2. **Single source of truth**: Each constant, type, or function has one logical home
3. **Specific imports**: Prefer importing from specific modules when possible
4. **No circular dependencies**: Prevent import cycles between domains
5. **Type safety**: Maintain strong TypeScript types throughout
6. **Documentation**: Keep this documentation up to date as structure evolves
