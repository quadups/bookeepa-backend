# Bookepa Backend

Production-oriented NestJS API for Bookepa, an Africa-first bookkeeping, debt tracking, invoicing, and WhatsApp-centric workflow platform for SMEs.

## Stack

- NestJS 11
- Prisma 7
- PostgreSQL
- Jest and Supertest
- Swagger/OpenAPI at `/api/docs` outside production, or when `ENABLE_SWAGGER=true`

## Local Setup

```bash
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
npm run start:dev
```

The API runs at `http://localhost:3000/api` by default.

## Key Commands

```bash
npm run build
npm run lint
npm test
npm run test:e2e
npm run prisma:validate
npm run prisma:migrate:dev
npm run db:seed
```

## Architecture Docs

Project decisions and conventions live in [`md/`](./md):

- [`md/ARCHITECTURE.md`](./md/ARCHITECTURE.md)
- [`md/API_CONVENTIONS.md`](./md/API_CONVENTIONS.md)
- [`md/DATABASE_DESIGN.md`](./md/DATABASE_DESIGN.md)
- [`md/TESTING.md`](./md/TESTING.md)
- [`md/adr/0001-modular-nestjs-prisma.md`](./md/adr/0001-modular-nestjs-prisma.md)
- [`md/adr/0002-business-scoped-geo-pricing.md`](./md/adr/0002-business-scoped-geo-pricing.md)

## Current MVP Surface

- Auth: signup, login, current user
- Business onboarding with owner membership and locked local pricing
- Customers
- Categories
- Transactions with pending/completed status and soft delete
- Invoices with computed line-item totals
- Manual message logging
- Computed dashboard totals
- Public pricing metadata

## Engineering Notes

- Money is stored as PostgreSQL decimals, not floats.
- Tenant access is business-scoped and enforced in services through `TenancyService`.
- Transactions are soft-deleted to preserve auditability.
- Dashboard totals are computed from completed, non-deleted transactions.
- Real WhatsApp sending, payments, wallet deductions, fraud automation, and AI insights are intentionally left as future domains.
