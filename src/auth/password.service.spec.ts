import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies a password', async () => {
    const hash = await service.hash('correct-horse-42');

    await expect(service.verify('correct-horse-42', hash)).resolves.toBe(true);
    await expect(service.verify('wrong-password-42', hash)).resolves.toBe(false);
  });

  it('rejects hashes in an unknown format', async () => {
    await expect(service.verify('correct-horse-42', 'bcrypt$fake')).resolves.toBe(
      false,
    );
  });
});
