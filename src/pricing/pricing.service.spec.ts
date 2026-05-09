import { PlanCode, PricingRegionTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const prisma = {
    countryPricing: {
      findUnique: jest.fn(),
    },
    pricingPlan: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves Nigerian starter pricing from fallback metadata', async () => {
    jest.spyOn(prisma.countryPricing, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.pricingPlan, 'findFirst').mockResolvedValue(null);

    const service = new PricingService(prisma);

    await expect(service.resolvePricingForCountry('ng')).resolves.toEqual({
      countryCode: 'NG',
      pricingRegion: PricingRegionTier.TIER_A,
      pricingTier: PlanCode.STARTER,
      billingCurrency: 'NGN',
      localizedPrice: '3000.00',
      isFallback: true,
    });
  });

  it('lists static plans when the pricing table has not been seeded', async () => {
    jest.spyOn(prisma.pricingPlan, 'findMany').mockResolvedValue([]);

    const service = new PricingService(prisma);
    const plans = await service.listPlans(PricingRegionTier.TIER_C);

    expect(plans).toHaveLength(3);
    expect(plans[0]).toMatchObject({
      code: PlanCode.STARTER,
      regionTier: PricingRegionTier.TIER_C,
      price: '12.00',
    });
  });
});
