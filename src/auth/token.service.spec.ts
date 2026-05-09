import { UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { TokenService } from './token.service';

function createService(expiresInSeconds = 3600): TokenService {
  return new TokenService({
    jwtSecret: 'test-secret-with-enough-length-for-hmac',
    jwtExpiresInSeconds: expiresInSeconds,
  } as AppConfigService);
}

describe('TokenService', () => {
  it('signs and verifies an access token', () => {
    const service = createService();
    const token = service.signAccessToken({
      sub: 'user-id',
      email: 'ada@example.com',
    });

    expect(service.verifyAccessToken(token)).toMatchObject({
      sub: 'user-id',
      email: 'ada@example.com',
    });
  });

  it('rejects tampered tokens', () => {
    const service = createService();
    const token = service.signAccessToken({
      sub: 'user-id',
      email: 'ada@example.com',
    });
    const tamperedToken = `${token.slice(0, -1)}x`;

    expect(() => service.verifyAccessToken(tamperedToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects expired tokens', () => {
    const service = createService(-1);
    const token = service.signAccessToken({
      sub: 'user-id',
      email: 'ada@example.com',
    });

    expect(() => service.verifyAccessToken(token)).toThrow(UnauthorizedException);
  });
});
