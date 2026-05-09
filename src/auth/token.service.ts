import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { AppConfigService } from '../config/config.service';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class TokenService {
  constructor(private readonly config: AppConfigService) {}

  signAccessToken(payload: Pick<AuthTokenPayload, 'sub' | 'email'>): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + this.config.jwtExpiresInSeconds;

    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const body = this.encode({ ...payload, iat: issuedAt, exp: expiresAt });
    const signature = this.sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    const [header, body, signature] = token.split('.');

    if (!header || !body || !signature) {
      throw new UnauthorizedException('Invalid bearer token.');
    }

    const expectedSignature = this.sign(`${header}.${body}`);

    if (!this.safeEquals(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid bearer token.');
    }

    const payload = this.decode<AuthTokenPayload>(body);
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub || !payload.email || payload.exp <= now) {
      throw new UnauthorizedException('Bearer token has expired.');
    }

    return payload;
  }

  private sign(value: string): string {
    return createHmac('sha256', this.config.jwtSecret)
      .update(value)
      .digest('base64url');
  }

  private encode(value: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
  }

  private decode<T>(value: string): T {
    try {
      return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
    } catch {
      throw new UnauthorizedException('Invalid bearer token.');
    }
  }

  private safeEquals(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
