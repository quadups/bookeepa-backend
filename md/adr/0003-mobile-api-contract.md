# ADR 0003: Mobile API Contract

## Status

Accepted

## Context

Bookepa will be consumed by mobile clients where users may have slow devices, unstable networks, and long-lived app versions. Backend changes need to protect mobile compatibility and prevent duplicate writes during retries.

## Decision

Use `/api/v1` as the first stable mobile API namespace.

Add mobile-focused backend primitives:

- refresh-token sessions through `AuthSession`
- cursor pagination through `limit`, `cursor`, and `nextCursor`
- transaction idempotency through `Idempotency-Key`
- JSON-safe serialization for decimals and dates
- generated OpenAPI output at `openapi/bookepa-api.v1.json`

## Consequences

Mobile engineers can generate a typed API client from the OpenAPI artifact and rely on stable v1 paths. Breaking API changes should be introduced under a future version instead of changing v1 in place.

The backend now has the minimum primitives needed for retry-safe financial workflows without implementing full offline sync yet.
