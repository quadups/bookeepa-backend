import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService', () => {
  const findUnique = jest.fn();
  const create = jest.fn();
  const prisma = {
    idempotencyKey: {
      findUnique,
      create,
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs the handler when no idempotency key is supplied', async () => {
    const service = new IdempotencyService(prisma);
    const handler = jest.fn().mockResolvedValue({ id: 'transaction-id' });

    await expect(
      service.run({
        userId: 'user-id',
        route: 'POST /api/v1/transactions',
        requestBody: { amount: 100 },
        handler,
      }),
    ).resolves.toEqual({ id: 'transaction-id' });

    expect(findUnique).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('returns the cached response for a repeated matching request', async () => {
    const service = new IdempotencyService(prisma);
    const handler = jest.fn();

    findUnique.mockResolvedValue({
      requestHash:
        '4d4bbe59c6aad22442cde199a6a8a5f034405fcd78fb5a81c24ef249de1c45f1',
      responseBody: { id: 'cached-transaction-id' },
    });

    await expect(
      service.run({
        userId: 'user-id',
        key: 'retry-key',
        route: 'POST /api/v1/transactions',
        requestBody: { amount: 100 },
        handler,
      }),
    ).resolves.toEqual({ id: 'cached-transaction-id' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects a reused key with a different request body', async () => {
    const service = new IdempotencyService(prisma);

    findUnique.mockResolvedValue({
      requestHash: 'different-hash',
      responseBody: { id: 'cached-transaction-id' },
    });

    await expect(
      service.run({
        userId: 'user-id',
        key: 'retry-key',
        route: 'POST /api/v1/transactions',
        requestBody: { amount: 100 },
        handler: jest.fn(),
      }),
    ).rejects.toThrow(ConflictException);
  });
});
