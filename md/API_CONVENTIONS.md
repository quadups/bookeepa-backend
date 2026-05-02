# API Conventions

## Base URL

All application routes are prefixed with `/api`.

Swagger documentation is available at `/api/docs` in non-production environments or when `ENABLE_SWAGGER=true`.

## Auth

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Public endpoints must be explicitly marked with `@Public()`.

## Validation

Global validation is enabled with:

- whitelist unknown properties
- reject non-whitelisted properties
- transform request payloads into DTO types

Every request body and query object should have a DTO with `class-validator` rules and Swagger decorators.

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
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me

POST /api/business
GET  /api/business
GET  /api/business/:id

POST   /api/customers
GET    /api/customers?businessId=
GET    /api/customers/:id
PATCH  /api/customers/:id
DELETE /api/customers/:id

POST /api/categories
GET  /api/categories?businessId=&type=

POST   /api/transactions
GET    /api/transactions?businessId=&from=&to=
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id

POST  /api/invoices
GET   /api/invoices?businessId=&status=
GET   /api/invoices/:id
PATCH /api/invoices/:id

POST /api/messages/send
GET  /api/messages?businessId=

GET /api/dashboard/:businessId

GET /api/pricing/plans
GET /api/pricing/countries/:countryCode
```
