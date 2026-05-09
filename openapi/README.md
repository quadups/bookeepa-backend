# OpenAPI Workflow

The backend can export a versioned OpenAPI document for mobile client generation.

```bash
npm run openapi:generate
```

This writes:

```text
openapi/bookepa-api.v1.json
```

The mobile app can use this artifact with tools such as `openapi-typescript`, `openapi-fetch`, or `orval` to generate a typed API client. Treat this file as a contract artifact: regenerate it after backend DTO or route changes.
