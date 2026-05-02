import {
  BillingInterval,
  PlanCode,
  PrismaClient,
  PricingRegionTier,
} from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    code: PlanCode.STARTER,
    name: 'Starter',
    regionTier: PricingRegionTier.TIER_A,
    currency: 'NGN',
    basePrice: '3000.00',
  },
  {
    code: PlanCode.GROWTH,
    name: 'Growth',
    regionTier: PricingRegionTier.TIER_A,
    currency: 'NGN',
    basePrice: '8000.00',
  },
  {
    code: PlanCode.PRO,
    name: 'Pro',
    regionTier: PricingRegionTier.TIER_A,
    currency: 'NGN',
    basePrice: '15000.00',
  },
  {
    code: PlanCode.STARTER,
    name: 'Starter',
    regionTier: PricingRegionTier.TIER_B,
    currency: 'USD',
    basePrice: '8.00',
  },
  {
    code: PlanCode.GROWTH,
    name: 'Growth',
    regionTier: PricingRegionTier.TIER_B,
    currency: 'USD',
    basePrice: '15.00',
  },
  {
    code: PlanCode.PRO,
    name: 'Pro',
    regionTier: PricingRegionTier.TIER_B,
    currency: 'USD',
    basePrice: '25.00',
  },
  {
    code: PlanCode.STARTER,
    name: 'Starter',
    regionTier: PricingRegionTier.TIER_C,
    currency: 'USD',
    basePrice: '12.00',
  },
  {
    code: PlanCode.GROWTH,
    name: 'Growth',
    regionTier: PricingRegionTier.TIER_C,
    currency: 'USD',
    basePrice: '29.00',
  },
  {
    code: PlanCode.PRO,
    name: 'Pro',
    regionTier: PricingRegionTier.TIER_C,
    currency: 'USD',
    basePrice: '79.00',
  },
];

const countries = [
  {
    countryCode: 'NG',
    regionTier: PricingRegionTier.TIER_A,
    currency: 'NGN',
    localizedPrice: '3000.00',
  },
  {
    countryCode: 'GH',
    regionTier: PricingRegionTier.TIER_A,
    currency: 'GHS',
    localizedPrice: '45.00',
  },
  {
    countryCode: 'KE',
    regionTier: PricingRegionTier.TIER_A,
    currency: 'KES',
    localizedPrice: '500.00',
  },
  {
    countryCode: 'ZA',
    regionTier: PricingRegionTier.TIER_B,
    currency: 'ZAR',
    localizedPrice: '150.00',
  },
  {
    countryCode: 'BR',
    regionTier: PricingRegionTier.TIER_B,
    currency: 'BRL',
    localizedPrice: '40.00',
  },
  {
    countryCode: 'GB',
    regionTier: PricingRegionTier.TIER_C,
    currency: 'GBP',
    localizedPrice: '12.00',
  },
  {
    countryCode: 'US',
    regionTier: PricingRegionTier.TIER_C,
    currency: 'USD',
    localizedPrice: '12.00',
  },
];

async function main(): Promise<void> {
  for (const plan of plans) {
    await prisma.pricingPlan.upsert({
      where: {
        code_regionTier_billingInterval: {
          code: plan.code,
          regionTier: plan.regionTier,
          billingInterval: BillingInterval.MONTHLY,
        },
      },
      update: {
        name: plan.name,
        basePrice: plan.basePrice,
        currency: plan.currency,
        features: [
          'Simple bookkeeping',
          'Customer tracking',
          'Manual reminders',
        ],
        isActive: true,
      },
      create: {
        ...plan,
        billingInterval: BillingInterval.MONTHLY,
        features: [
          'Simple bookkeeping',
          'Customer tracking',
          'Manual reminders',
        ],
      },
    });
  }

  for (const country of countries) {
    await prisma.countryPricing.upsert({
      where: { countryCode: country.countryCode },
      update: country,
      create: country,
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
