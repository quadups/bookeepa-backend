# ADR 0001: Modular NestJS With Prisma

## Status

Accepted

## Context

Bookepa needs to move quickly from MVP to fintech-adjacent workflows without creating a monolith where billing, messaging, bookkeeping, and analytics all share one service.

## Decision

Use NestJS modules organized by product domain and Prisma as the database access layer.

Each module owns:

- controller
- service
- DTOs
- local tests

Shared concerns live in:

- `config`
- `prisma`
- `common`

## Consequences

Adding a new feature means creating or extending a focused domain module. Cross-cutting behavior such as tenancy and Prisma error handling stays centralized.

This keeps the MVP small while giving future engineers obvious boundaries for payments, wallet billing, WhatsApp automation, and insights.
