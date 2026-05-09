import { Injectable } from '@nestjs/common';
import {
  BillingInterval,
  PlanCode,
  PricingPlan,
  PricingRegionTier,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingPlanDto, ResolvedPricingDto } from './dto/pricing.dto';

type StaticPlan = {
  name: string;
  currency: string;
  price: string;
  features: string[];
};

type StaticCountryPricing = {
  regionTier: PricingRegionTier;
  currency: string;
};

const STATIC_COUNTRY_PRICING: Record<string, StaticCountryPricing> = {
  NG: { regionTier: PricingRegionTier.TIER_A, currency: 'NGN' },
  GH: { regionTier: PricingRegionTier.TIER_A, currency: 'GHS' },
  KE: { regionTier: PricingRegionTier.TIER_A, currency: 'KES' },
  ZA: { regionTier: PricingRegionTier.TIER_B, currency: 'ZAR' },
  BR: { regionTier: PricingRegionTier.TIER_B, currency: 'BRL' },
  GB: { regionTier: PricingRegionTier.TIER_C, currency: 'GBP' },
  US: { regionTier: PricingRegionTier.TIER_C, currency: 'USD' },
};

const STATIC_PLAN_PRICES: Record<
  PricingRegionTier,
  Record<PlanCode, StaticPlan>
> = {
  [PricingRegionTier.TIER_A]: {
    [PlanCode.STARTER]: {
      name: 'Starter',
      currency: 'NGN',
      price: '3000.00',
      features: ['Simple bookkeeping', 'Customer tracking', 'Manual reminders'],
    },
    [PlanCode.GROWTH]: {
      name: 'Growth',
      currency: 'NGN',
      price: '8000.00',
      features: ['Everything in Starter', 'Invoicing', 'More monthly activity'],
    },
    [PlanCode.PRO]: {
      name: 'Pro',
      currency: 'NGN',
      price: '15000.00',
      features: ['Everything in Growth', 'Team access', 'Advanced reporting'],
    },
  },
  [PricingRegionTier.TIER_B]: {
    [PlanCode.STARTER]: {
      name: 'Starter',
      currency: 'USD',
      price: '8.00',
      features: ['Simple bookkeeping', 'Customer tracking', 'Manual reminders'],
    },
    [PlanCode.GROWTH]: {
      name: 'Growth',
      currency: 'USD',
      price: '15.00',
      features: ['Everything in Starter', 'Invoicing', 'More monthly activity'],
    },
    [PlanCode.PRO]: {
      name: 'Pro',
      currency: 'USD',
      price: '25.00',
      features: ['Everything in Growth', 'Team access', 'Advanced reporting'],
    },
  },
  [PricingRegionTier.TIER_C]: {
    [PlanCode.STARTER]: {
      name: 'Starter',
      currency: 'USD',
      price: '12.00',
      features: ['Simple bookkeeping', 'Customer tracking', 'Manual reminders'],
    },
    [PlanCode.GROWTH]: {
      name: 'Growth',
      currency: 'USD',
      price: '29.00',
      features: ['Everything in Starter', 'Invoicing', 'More monthly activity'],
    },
    [PlanCode.PRO]: {
      name: 'Pro',
      currency: 'USD',
      price: '79.00',
      features: ['Everything in Growth', 'Team access', 'Advanced reporting'],
    },
  },
};

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async resolvePricingForCountry(
    countryCode: string,
    planCode: PlanCode = PlanCode.STARTER,
  ): Promise<ResolvedPricingDto> {
    const normalizedCountry = this.normalizeCountry(countryCode);
    const countryPricing = await this.prisma.countryPricing.findUnique({
      where: { countryCode: normalizedCountry },
    });
    const fallbackCountry =
      STATIC_COUNTRY_PRICING[normalizedCountry] ??
      ({ regionTier: PricingRegionTier.TIER_C, currency: 'USD' } satisfies StaticCountryPricing);
    const regionTier = countryPricing?.regionTier ?? fallbackCountry.regionTier;
    const staticPlan = STATIC_PLAN_PRICES[regionTier][planCode];
    const plan = await this.prisma.pricingPlan.findFirst({
      where: {
        code: planCode,
        regionTier,
        billingInterval: BillingInterval.MONTHLY,
        isActive: true,
      },
    });

    return {
      countryCode: normalizedCountry,
      pricingRegion: regionTier,
      pricingTier: planCode,
      billingCurrency:
        plan?.currency ?? countryPricing?.currency ?? fallbackCountry.currency,
      localizedPrice:
        plan?.basePrice.toFixed(2) ??
        countryPricing?.localizedPrice.toFixed(2) ??
        staticPlan.price,
      isFallback: !countryPricing || !plan,
    };
  }

  async listPlans(regionTier?: PricingRegionTier): Promise<PricingPlanDto[]> {
    const dbPlans = await this.prisma.pricingPlan.findMany({
      where: {
        isActive: true,
        regionTier,
        billingInterval: BillingInterval.MONTHLY,
      },
      orderBy: [{ regionTier: 'asc' }, { basePrice: 'asc' }],
    });

    if (dbPlans.length > 0) {
      return dbPlans.map((plan) => this.toPlanDto(plan));
    }

    const tiers = regionTier ? [regionTier] : Object.values(PricingRegionTier);

    return tiers.flatMap((tier) =>
      Object.values(PlanCode).map((code) => {
        const plan = STATIC_PLAN_PRICES[tier][code];

        return {
          code,
          name: plan.name,
          regionTier: tier,
          billingInterval: BillingInterval.MONTHLY,
          currency: plan.currency,
          price: plan.price,
          features: plan.features,
        };
      }),
    );
  }

  private toPlanDto(plan: PricingPlan): PricingPlanDto {
    return {
      code: plan.code,
      name: plan.name,
      regionTier: plan.regionTier,
      billingInterval: plan.billingInterval,
      currency: plan.currency,
      price: plan.basePrice.toFixed(2),
      features: Array.isArray(plan.features)
        ? plan.features.filter((feature): feature is string => typeof feature === 'string')
        : [],
    };
  }

  private normalizeCountry(countryCode: string): string {
    return countryCode.trim().toUpperCase();
  }
}
