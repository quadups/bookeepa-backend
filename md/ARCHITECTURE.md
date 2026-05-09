# Bookepa Backend Architecture

## Intent

Bookepa starts as simple bookkeeping for SMEs, but the backend is structured so it can grow into a financial operating system without a rewrite. The MVP focuses on fast transaction entry, debt visibility, invoicing, manual reminders, and business-scoped local pricing.

## Runtime Shape

- `main.ts` owns process bootstrap: API version prefix, validation, CORS, Swagger, and server start.
- `http-config.ts` centralizes `/api/v1` and shared HTTP setup so tests, OpenAPI export, and runtime stay aligned.
- `AppModule` wires platform modules and global providers.
- `ConfigModule` reads environment variables without spreading `process.env` across the codebase.
- `PrismaModule` owns the Prisma lifecycle.
- `CommonModule` exposes cross-domain services such as tenancy checks.

## Domain Modules

Each domain keeps its controller, service, and DTOs together:

- `auth`
- `businesses`
- `customers`
- `categories`
- `transactions`
- `invoices`
- `messages`
- `dashboard`
- `pricing`
- `billing`

Controllers should stay thin. They translate HTTP input into service calls and document the API contract. Services own business rules, tenant checks, database writes, and cross-entity validation.

## Tenancy

Bookepa is business-scoped. A user may belong to many businesses, and a business may have many users.

Rules:

- Every protected business operation must verify membership through `TenancyService`.
- New businesses create an `OWNER` membership for the creator.
- Related records must be verified against the same `businessId` before writes.
- Avoid relying on client-supplied `businessId` without membership validation.

## Money

All financial amounts use Prisma `Decimal` fields backed by PostgreSQL decimal columns. API examples show money as string values because string transport avoids floating point surprises in clients.

## Auth

The current implementation uses a small HMAC JWT service and Node's built-in `scrypt` password hashing. Mobile sessions use opaque refresh tokens stored as hashes in `AuthSession`. Refresh tokens rotate on refresh and can be revoked through logout.

## Mobile Readiness

Mobile clients need stable contracts and retry-safe writes:

- `/api/v1` is the first stable API namespace.
- list endpoints use cursor pagination with `limit`, `cursor`, and `nextCursor`.
- transaction creation accepts `Idempotency-Key` so retries do not duplicate records.
- Prisma decimals and dates are serialized into JSON-safe strings.
- `npm run openapi:generate` exports `openapi/bookepa-api.v1.json` for typed mobile client generation.

## Billing Entitlements

Plan enforcement is centralized in `billing`, not scattered through feature modules.

Core concepts:

- `Feature`: a capability the product can enable, disable, or limit.
- `PricingPlan`: the commercial plan a business is on.
- `PlanEntitlement`: the rule connecting a plan to a feature.
- `Usage`: metered consumption for quota-backed features.

Product modules should never check plan names directly. They should call:

```ts
await this.entitlementsService.assertWithinQuota(
  businessId,
  FEATURE_CODES.TRANSACTIONS,
  1,
);
```

This keeps plan changes data-driven. Adding a new plan limit should normally mean updating seed/admin data and calling the entitlement service from the relevant write path.

## Extension Points

Planned domains should be added as new modules rather than folded into existing services:

- payment links and webhook processing
- wallet and usage billing
- real WhatsApp integration
- automation rules and templates
- insights and credit/lending workflows
