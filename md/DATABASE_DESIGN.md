# Database Design

## Guiding Principles

- Keep the MVP simple for SMEs.
- Preserve auditability for financial records.
- Keep all business data tenant-scoped.
- Use decimal types for money.
- Store pricing decisions on the business so revenue logic is stable after onboarding.

## Core MVP Tables

- `User`
- `Business`
- `BusinessMember`
- `Customer`
- `Category`
- `Transaction`
- `Invoice`
- `InvoiceItem`
- `Message`

## Revenue and Pricing Tables

- `PricingPlan`
- `CountryPricing`
- `Subscription`
- `Usage`
- `Feature`
- `PlanEntitlement`
- `AuthSession`
- `IdempotencyKey`

Pricing is business-level, not user-level. This supports accountants or owners who manage multiple businesses in different countries.

Feature access is plan-entitlement based:

- `Feature` defines a product capability using a stable string code.
- `PlanEntitlement` defines whether a plan enables that feature and whether it has a quota.
- `Usage` records consumption for quota-backed features.

Business logic should ask the entitlement service whether a business can use a feature. It should not branch directly on `PlanCode`.

## Transaction Model

Bookepa intentionally starts with a simplified transaction ledger, not full double-entry accounting. Each transaction has:

- `type`: `INCOME` or `EXPENSE`
- `status`: `PENDING` or `COMPLETED`
- `amount`
- `currency`
- optional customer, vendor, category, and payment method references
- `isDeleted` for soft delete

Dashboard totals only use completed, non-deleted transactions.

## Invoices

Invoices are kept as real tables in the MVP because future payment links, partial payments, reminders, and audit trails need stable invoice IDs. Totals are computed server-side from invoice items.

## Geo Pricing

The business creation flow resolves pricing from the selected country and locks the result onto `Business`:

- `pricingRegion`
- `pricingTier`
- `billingCurrency`
- `localizedPrice`
- `pricingLockedAt`

`CountryPricing` and `PricingPlan` can be seeded and later replaced by dynamic PPP logic without changing business records already created.

## Future Tables

The schema already leaves room for suppliers, payment methods, usage, subscriptions, activity logs, auth sessions, and idempotent mobile writes. Wallets, webhook events, real payment links, attachments, automation rules, insights, and lending records should be added when those product capabilities enter scope.

## Mobile-Specific Tables

`AuthSession` stores hashed refresh tokens and session metadata. This supports mobile login persistence, token rotation, and server-side revocation.

`IdempotencyKey` stores the request hash and response body for retry-safe writes. This matters most for transaction creation because mobile networks often retry after timeouts.

## Entitlement Enforcement

Initial enforced MVP features:

- `CUSTOMERS`
- `TRANSACTIONS`
- `INVOICES`
- `MANUAL_REMINDERS`

Future features can be added by inserting a `Feature`, attaching `PlanEntitlement` rows to plans, and checking that feature code at the product boundary.
