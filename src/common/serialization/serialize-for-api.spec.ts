import { Prisma } from '@prisma/client';
import { serializeForApi } from './serialize-for-api';

describe('serializeForApi', () => {
  it('serializes decimals and dates into mobile-safe values', () => {
    expect(
      serializeForApi({
        amount: new Prisma.Decimal('12500.5'),
        createdAt: new Date('2026-05-02T10:00:00.000Z'),
        items: [{ total: new Prisma.Decimal('10') }],
      }),
    ).toEqual({
      amount: '12500.50',
      createdAt: '2026-05-02T10:00:00.000Z',
      items: [{ total: '10.00' }],
    });
  });
});
