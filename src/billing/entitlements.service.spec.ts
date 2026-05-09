import {
  EntitlementEnforcement,
  EntitlementPeriod,
  PlanCode,
  PricingRegionTier,
  SubscriptionStatus,
} from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FEATURE_CODES } from './feature-codes';
import { EntitlementsService } from './entitlements.service';

function createPlan(limit: number | null) {
  return {
    id: 'plan-id',
    code: PlanCode.STARTER,
    name: 'Starter',
    regionTier: PricingRegionTier.TIER_A,
    entitlements: [
      {
        id: 'entitlement-id',
        planId: 'plan-id',
        featureCode: FEATURE_CODES.TRANSACTIONS,
        enabled: true,
        limit,
        period: EntitlementPeriod.MONTHLY,
        enforcement: EntitlementEnforcement.BLOCK,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        feature: { name: 'Transactions' },
      },
    ],
  };
}

describe('EntitlementsService', () => {
  const prisma = {
    subscription: {
      findFirst: jest.fn(),
    },
    business: {
      findUnique: jest.fn(),
    },
    pricingPlan: {
      findFirst: jest.fn(),
    },
    usage: {
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    customer: {
      count: jest.fn(),
    },
    businessMember: {
      count: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows usage when the business is within quota', async () => {
    jest.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({
      status: SubscriptionStatus.ACTIVE,
      plan: createPlan(10),
    });
    jest.spyOn(prisma.usage, 'aggregate').mockResolvedValue({
      _sum: { quantity: 3 },
    });

    const service = new EntitlementsService(prisma);

    await expect(
      service.assertWithinQuota('business-id', FEATURE_CODES.TRANSACTIONS, 2),
    ).resolves.toBeUndefined();
  });

  it('blocks usage when the plan limit would be exceeded', async () => {
    jest.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({
      status: SubscriptionStatus.ACTIVE,
      plan: createPlan(4),
    });
    jest.spyOn(prisma.usage, 'aggregate').mockResolvedValue({
      _sum: { quantity: 3 },
    });

    const service = new EntitlementsService(prisma);

    await expect(
      service.assertWithinQuota('business-id', FEATURE_CODES.TRANSACTIONS, 2),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns entitlement details for mobile clients', async () => {
    jest.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({
      status: SubscriptionStatus.ACTIVE,
      plan: createPlan(10),
    });
    jest.spyOn(prisma.usage, 'aggregate').mockResolvedValue({
      _sum: { quantity: 4 },
    });

    const service = new EntitlementsService(prisma);

    await expect(service.getBusinessEntitlements('business-id')).resolves.toEqual(
      {
        businessId: 'business-id',
        plan: {
          id: 'plan-id',
          code: PlanCode.STARTER,
          name: 'Starter',
          regionTier: PricingRegionTier.TIER_A,
        },
        features: [
          {
            code: FEATURE_CODES.TRANSACTIONS,
            name: 'Transactions',
            enabled: true,
            limit: 10,
            period: EntitlementPeriod.MONTHLY,
            enforcement: EntitlementEnforcement.BLOCK,
            used: 4,
            remaining: 6,
          },
        ],
      },
    );
  });
});
