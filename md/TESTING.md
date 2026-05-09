# Testing Strategy

## Current Test Layers

Unit tests live beside the code they verify:

- `*.spec.ts` inside `src`

E2E tests live in:

- `test/*.e2e-spec.ts`

## What To Unit Test

Prioritize business rules and security boundaries:

- password hashing and token verification
- pricing resolution and fallbacks
- tenant access checks
- cursor pagination helpers
- response serialization for Decimal and Date values
- idempotency key replay and conflict behavior
- entitlement resolution, quota allowance, and quota blocking
- transaction currency enforcement
- invoice total calculation
- message reference validation
- dashboard aggregate calculations

## What To E2E Test

Use E2E tests for HTTP behavior:

- auth flow
- business onboarding
- transaction creation
- invoice creation
- dashboard response
- validation failures

Mock Prisma only for shell-level tests such as the health endpoint. For real endpoint E2E coverage, run against an isolated test database.

## Commands

```bash
npm test
npm run test:e2e
npm run test:cov
```

The e2e script runs in-band to avoid worker-spawn instability on Windows development machines and small CI runners.
