import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { serializeForApi } from '../serialization/serialize-for-api';

interface IdempotencyOptions<T> {
  userId: string;
  businessId?: string;
  key?: string;
  route: string;
  requestBody: unknown;
  handler: () => Promise<T>;
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(options: IdempotencyOptions<T>): Promise<T> {
    const key = options.key?.trim();

    if (!key) {
      return options.handler();
    }

    if (key.length > 128) {
      throw new BadRequestException(
        'Idempotency-Key must be 128 characters or fewer.',
      );
    }

    const requestHash = this.hashPayload(options.requestBody);
    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: {
        userId_route_key: {
          userId: options.userId,
          route: options.route,
          key,
        },
      },
    });

    if (existingKey) {
      if (existingKey.requestHash !== requestHash) {
        throw new ConflictException(
          'Idempotency-Key has already been used with a different request body.',
        );
      }

      return existingKey.responseBody as T;
    }

    const response = await options.handler();
    const responseBody = serializeForApi(response) as Prisma.InputJsonValue;

    await this.prisma.idempotencyKey.create({
      data: {
        userId: options.userId,
        businessId: options.businessId,
        key,
        route: options.route,
        requestHash,
        responseBody,
        statusCode: 201,
        expiresAt: this.expiresInDays(1),
      },
    });

    return response;
  }

  private hashPayload(value: unknown): string {
    return createHash('sha256')
      .update(JSON.stringify(this.sortObject(value)))
      .digest('hex');
  }

  private sortObject(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortObject(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, nestedValue]) => [key, this.sortObject(nestedValue)]),
      );
    }

    return value;
  }

  private expiresInDays(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
