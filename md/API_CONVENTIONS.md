# API Conventions

## Base URL

All application routes are prefixed with `/api/v1`.

Swagger documentation is available at `/api/docs` in non-production environments or when `ENABLE_SWAGGER=true`.

The generated mobile contract is written to `openapi/bookepa-api.v1.json` with:

```bash
npm run openapi:generate
```

## Auth

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Public endpoints must be explicitly marked with `@Public()`.

Mobile clients receive short-lived access tokens and long-lived opaque refresh tokens. Refresh tokens are stored server-side as hashes in `AuthSession` and are rotated by `POST /api/v1/auth/refresh`.

## Validation

Global validation is enabled with:

- whitelist unknown properties
- reject non-whitelisted properties
- transform request payloads into DTO types

Every request body and query object should have a DTO with `class-validator` rules and Swagger decorators.

## Pagination

List endpoints use cursor pagination:

```http
GET /api/v1/transactions?businessId=<id>&limit=20&cursor=<lastSeenId>
```

Paginated responses return:

```json
{
  "data": [],
  "meta": {
    "limit": 20,
    "nextCursor": null
  }
}
```

## Idempotency

Mobile networks retry. Create endpoints that can create financial records should accept an optional `Idempotency-Key` header. Transaction creation supports this now:

```http
Idempotency-Key: 018f-bookepa-mobile-retry-key
```

Reusing the same key with the same request body returns the original response. Reusing it with a different body returns `409 Conflict`.

## Tenant Scoping

Endpoints that operate on business data must either:

- accept `businessId` and validate membership, or
- load the entity first, then validate membership against the entity's `businessId`

Never trust `businessId` from the client as authorization by itself.

## Error Style

Use Nest exceptions:

- `BadRequestException` for invalid input or cross-business references
- `UnauthorizedException` for auth failures
- `ForbiddenException` for role restrictions
- `NotFoundException` for missing tenant-visible records
- `ConflictException` for uniqueness conflicts

Prisma known request errors are mapped globally by `PrismaExceptionFilter`.

## MVP Endpoints

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me

POST /api/v1/business
GET  /api/v1/business
GET  /api/v1/business/:id

POST   /api/v1/customers
GET    /api/v1/customers?businessId=&limit=&cursor=
GET    /api/v1/customers/:id
PATCH  /api/v1/customers/:id
DELETE /api/v1/customers/:id

POST /api/v1/categories
GET  /api/v1/categories?businessId=&type=

POST   /api/v1/transactions
GET    /api/v1/transactions?businessId=&from=&to=&limit=&cursor=
GET    /api/v1/transactions/:id
PATCH  /api/v1/transactions/:id
DELETE /api/v1/transactions/:id

POST  /api/v1/invoices
GET   /api/v1/invoices?businessId=&status=&limit=&cursor=
GET   /api/v1/invoices/:id
PATCH /api/v1/invoices/:id

POST /api/v1/messages/send
GET  /api/v1/messages?businessId=&limit=&cursor=

GET /api/v1/dashboard/:businessId

GET /api/v1/pricing/plans
GET /api/v1/pricing/countries/:countryCode

GET /api/v1/billing/entitlements?businessId=
```

## Billing Entitlements

The mobile app may use `GET /api/v1/billing/entitlements?businessId=` to decide which UI affordances to show, but the backend remains the source of truth and enforces limits server-side.

Example response:

```json
{
  "businessId": "business-id",
  "plan": {
    "id": "plan-id",
    "code": "STARTER",
    "name": "Starter",
    "regionTier": "TIER_A"
  },
  "features": [
    {
      "code": "TRANSACTIONS",
      "name": "Transactions",
      "enabled": true,
      "limit": 300,
      "period": "MONTHLY",
      "enforcement": "BLOCK",
      "used": 42,
      "remaining": 258
    }
  ]
}
```
