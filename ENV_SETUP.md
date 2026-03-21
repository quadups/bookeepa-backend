# Environment Configuration Guide

This project uses environment-specific configuration files for different deployment environments.

## Environment Files

- **`.env.dev`** - Development environment (local machine)
- **`.env.staging`** - Staging environment (pre-production testing)
- **`.env.prod`** - Production environment (live)
- **`.env.example`** - Template for environment variables

## Using Environment Files

### Development
```bash
# Copy dev environment
cp .env.dev .env

# Start development server
pnpm start:dev
```

### Staging
```bash
# Copy staging environment
cp .env.staging .env

# Build and start
pnpm build
pnpm start:prod
```

### Production
```bash
# Copy production environment
cp .env.prod .env

# Build and start
pnpm build
pnpm start:prod
```

## Environment Variables

### Application
- `NODE_ENV` - Environment name (development, staging, production)
- `PORT` - Server port (default: 3000)
- `API_URL` - Base URL for the API

### CORS
- `CORS_ORIGIN` - Allowed origins for CORS (comma-separated)

### Swagger
- `ENABLE_SWAGGER` - Enable/disable Swagger UI (true/false)
  - **Disabled by default in staging and production** for security

### Database
- `DATABASE_URL` - Database connection URL

### JWT Authentication
- `JWT_SECRET` - Secret key for JWT signing (use a secure vault in production)
- `JWT_EXPIRATION` - Token expiration time in seconds

### Logging
- `LOG_LEVEL` - Log level (debug, info, warn, error)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use `.env.example`** as a template in the repository
3. **In production:**
   - Store secrets in a secure vault (AWS Secrets Manager, Azure KeyVault, etc.)
   - Use strong, random JWT secrets
   - Disable Swagger UI
   - Use HTTPS for API_URL
   - Restrict CORS origins
4. **Rotate secrets regularly** in staging and production
5. **Use environment-specific database instances**

## Local Development Setup

1. Copy `.env.dev` to `.env`:
   ```bash
   cp .env.dev .env
   ```

2. Update variables if needed (especially database credentials)

3. Run the application:
   ```bash
   pnpm start:dev
   ```

## CI/CD Integration

For automated deployments, environment variables can be:
- Set in CI/CD pipeline secrets
- Passed as environment variables during deployment
- Loaded from secure vaults

Example for GitHub Actions:
```yaml
- name: Build and Deploy
  env:
    NODE_ENV: ${{ secrets.NODE_ENV }}
    PORT: ${{ secrets.PORT }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```
