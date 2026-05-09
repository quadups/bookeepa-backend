import { Prisma } from '@prisma/client';

export function serializeForApi(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) {
    return value.toFixed(2);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForApi(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializeForApi(nestedValue),
      ]),
    );
  }

  return value;
}
