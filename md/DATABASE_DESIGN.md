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

Pricing is business-level, not user-level. This supports accountants or owners who manage multiple businesses in different countries.

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

The schema already leaves room for suppliers, payment methods, usage, subscriptions, and activity logs. Wallets, webhook events, real payment links, attachments, automation rules, insights, and lending records should be added when those product capabilities enter scope.
