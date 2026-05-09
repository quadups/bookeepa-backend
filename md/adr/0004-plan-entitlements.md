# ADR 0004: Plan Entitlements

## Status

Accepted

## Context

Bookepa needs to add, remove, and limit paid features without rewriting product modules whenever pricing changes. Checking plan names directly in services would make future pricing experiments, regional plan differences, trials, add-ons, and enterprise overrides expensive.

## Decision

Use a central entitlement model:

- `Feature` stores stable product capability codes.
- `PlanEntitlement` maps a `PricingPlan` to feature availability, quotas, periods, and enforcement style.
- `Usage` records consumption.
- `EntitlementsService` is the only place that decides whether a business can use a feature.

Product modules call the entitlement service with a feature code before creating limited resources.

## Consequences

Plan changes become mostly data changes. Adding a new feature limit means:

1. Add a feature code.
2. Seed or configure `Feature` and `PlanEntitlement`.
3. Add one entitlement check at the product boundary.
4. Record usage after the successful action.

This design supports regional pricing, custom plans, trials, overage billing, and future wallet deductions without refactoring every business workflow.
