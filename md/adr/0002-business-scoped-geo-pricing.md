# ADR 0002: Business-Scoped Geo Pricing

## Status

Accepted

## Context

Bookepa needs local pricing so African SMEs can afford the product while developed markets still pay prices aligned with their willingness to pay.

Pricing cannot be user-scoped because one user may manage businesses in multiple countries.

## Decision

Resolve pricing during business creation and store the result on `Business`.

Stored fields:

- `pricingRegion`
- `pricingTier`
- `billingCurrency`
- `localizedPrice`
- `pricingLockedAt`

Country and plan metadata lives in `CountryPricing` and `PricingPlan`. The service can use seeded database values, with static fallback metadata for local development and early MVP environments.

## Consequences

The business keeps a stable pricing contract after onboarding. Future payment method country checks, phone verification, and review workflows can update pricing through explicit business events rather than silent recalculation.

This approach supports adoption in lower-income markets and revenue capture in developed markets without making pricing depend on unreliable IP detection.
