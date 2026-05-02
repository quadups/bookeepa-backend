import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const FORMAT = 'scrypt';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64url');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

    return `${FORMAT}$${salt}$${derivedKey.toString('base64url')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [format, salt, key] = storedHash.split('$');

    if (format !== FORMAT || !salt || !key) {
      return false;
    }

    const storedKey = Buffer.from(key, 'base64url');
    const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;

    if (storedKey.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKey, derivedKey);
  }
}
