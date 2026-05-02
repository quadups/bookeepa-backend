# Bookepa Backend Architecture

## Intent

Bookepa starts as simple bookkeeping for SMEs, but the backend is structured so it can grow into a financial operating system without a rewrite. The MVP focuses on fast transaction entry, debt visibility, invoicing, manual reminders, and business-scoped local pricing.

## Runtime Shape

- `main.ts` owns process bootstrap: API prefix, validation, CORS, Swagger, and server start.
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

The current implementation uses a small HMAC JWT service and Node's built-in `scrypt` password hashing so the repo does not depend on undeclared auth packages. If the project later adopts `@nestjs/jwt` or an external identity provider, keep the controller contract stable and swap the implementation behind `AuthService`.

## Extension Points

Planned domains should be added as new modules rather than folded into existing services:

- payment links and webhook processing
- wallet and usage billing
- real WhatsApp integration
- automation rules and templates
- insights and credit/lending workflows
