import { Injectable } from '@nestjs/common';

type NodeEnv = 'development' | 'test' | 'staging' | 'production';

@Injectable()
export class AppConfigService {
  get nodeEnv(): NodeEnv {
    const value = this.getOptional('NODE_ENV') ?? 'development';

    if (['development', 'test', 'staging', 'production'].includes(value)) {
      return value as NodeEnv;
    }

    return 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.getNumber('PORT', 3000);
  }

  get apiUrl(): string {
    return this.getOptional('API_URL') ?? `http://localhost:${this.port}`;
  }

  get corsOrigins(): string[] {
    const raw = this.getOptional('CORS_ORIGIN') ?? 'http://localhost:3000';

    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get swaggerEnabled(): boolean {
    return (
      !this.isProduction ||
      (this.getOptional('ENABLE_SWAGGER') ?? '').toLowerCase() === 'true'
    );
  }

  get databaseUrl(): string {
    const url = this.getOptional('DATABASE_URL');

    if (!url) {
      throw new Error('DATABASE_URL must be set.');
    }

    return url;
  }

  get jwtSecret(): string {
    const fallback = 'local-development-secret-change-me';
    const secret = this.getOptional('JWT_SECRET') ?? fallback;

    if (this.isProduction && secret === fallback) {
      throw new Error('JWT_SECRET must be set in production.');
    }

    if (this.isProduction && secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production.');
    }

    return secret;
  }

  get jwtExpiresInSeconds(): number {
    return this.getNumber('JWT_EXPIRATION', 3600);
  }

  get refreshTokenExpiresInDays(): number {
    return this.getNumber('REFRESH_TOKEN_EXPIRATION_DAYS', 30);
  }

  private getNumber(key: string, fallback: number): number {
    const raw = this.getOptional(key);

    if (!raw) {
      return fallback;
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private getOptional(key: string): string | undefined {
    const value = process.env[key];
    return value && value.trim().length > 0 ? value.trim() : undefined;
  }
}
