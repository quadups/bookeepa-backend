import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  EntitlementEnforcement,
  EntitlementPeriod,
  PlanEntitlement,
  PricingPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FEATURE_CODES } from './feature-codes';
import {
  BillingEntitlementsResponseDto,
  FeatureEntitlementDto,
} from './dto/billing-entitlements.dto';

type PlanWithEntitlements = PricingPlan & {
  entitlements: Array<PlanEntitlement & { feature: { name: string } }>;
};

interface PeriodRange {
  periodStart: Date;
  periodEnd: Date;
}

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusinessEntitlements(
    businessId: string,
  ): Promise<BillingEntitlementsResponseDto> {
    const plan = await this.resolvePlanForBusiness(businessId);
    const features = await Promise.all(
      plan.entitlements.map((entitlement) =>
        this.toFeatureEntitlementDto(businessId, entitlement),
      ),
    );

    return {
      businessId,
      plan: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        regionTier: plan.regionTier,
      },
      features,
    };
  }

  async assertCanUseFeature(
    businessId: string,
    featureCode: string,
  ): Promise<PlanEntitlement> {
    const entitlement = await this.resolveEntitlement(businessId, featureCode);

    if (!entitlement.enabled) {
      throw new ForbiddenException(
        `Feature ${featureCode} is not enabled for this business plan.`,
      );
    }

    return entitlement;
  }

  async assertWithinQuota(
    businessId: string,
    featureCode: string,
    quantity = 1,
  ): Promise<void> {
    const entitlement = await this.assertCanUseFeature(businessId, featureCode);

    if (entitlement.limit === null) {
      return;
    }

    const used = await this.getUsageForEntitlement(businessId, entitlement);
    const wouldUse = used + quantity;

    if (
      wouldUse > entitlement.limit &&
      entitlement.enforcement === EntitlementEnforcement.BLOCK
    ) {
      throw new ForbiddenException(
        `Feature ${featureCode} has reached its plan limit of ${entitlement.limit}.`,
      );
    }
  }

  async recordUsage(
    businessId: string,
    featureCode: string,
    quantity = 1,
  ): Promise<void> {
    const entitlement = await this.resolveEntitlement(businessId, featureCode);
    const period = this.resolvePeriod(entitlement.period);

    await this.prisma.usage.create({
      data: {
        businessId,
        metric: featureCode,
        quantity,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
      },
    });
  }

  private async resolveEntitlement(
    businessId: string,
    featureCode: string,
  ): Promise<PlanEntitlement> {
    const plan = await this.resolvePlanForBusiness(businessId);
    const entitlement = plan.entitlements.find(
      (candidate) => candidate.featureCode === featureCode,
    );

    if (!entitlement) {
      throw new ForbiddenException(
        `Feature ${featureCode} is not configured for this business plan.`,
      );
    }

    return entitlement;
  }

  private async resolvePlanForBusiness(
    businessId: string,
  ): Promise<PlanWithEntitlements> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        businessId,
        status: {
          in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE],
        },
      },
      include: {
        plan: {
          include: {
            entitlements: {
              include: { feature: { select: { name: true } } },
              orderBy: { featureCode: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription) {
      return subscription.plan;
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        pricingTier: true,
        pricingRegion: true,
      },
    });

    if (!business?.pricingTier || !business.pricingRegion) {
      throw new ConflictException(
        'Business does not have a pricing plan configured.',
      );
    }

    const plan = await this.prisma.pricingPlan.findFirst({
      where: {
        code: business.pricingTier,
        regionTier: business.pricingRegion,
        isActive: true,
      },
      include: {
        entitlements: {
          include: { feature: { select: { name: true } } },
          orderBy: { featureCode: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      throw new ConflictException(
        'Pricing plan is missing. Seed billing plans before enforcing features.',
      );
    }

    return plan;
  }

  private async toFeatureEntitlementDto(
    businessId: string,
    entitlement: PlanEntitlement & { feature: { name: string } },
  ): Promise<FeatureEntitlementDto> {
    const used = await this.getUsageForEntitlement(businessId, entitlement);
    const remaining =
      entitlement.limit === null ? null : Math.max(entitlement.limit - used, 0);

    return {
      code: entitlement.featureCode,
      name: entitlement.feature.name,
      enabled: entitlement.enabled,
      limit: entitlement.limit,
      period: entitlement.period,
      enforcement: entitlement.enforcement,
      used,
      remaining,
    };
  }

  private async getUsageForEntitlement(
    businessId: string,
    entitlement: PlanEntitlement,
  ): Promise<number> {
    if (entitlement.featureCode === FEATURE_CODES.CUSTOMERS) {
      return this.prisma.customer.count({
        where: { businessId, isDeleted: false },
      });
    }

    if (entitlement.featureCode === FEATURE_CODES.TEAM_MEMBERS) {
      return this.prisma.businessMember.count({
        where: { businessId },
      });
    }

    if (!entitlement.period) {
      return 0;
    }

    const period = this.resolvePeriod(entitlement.period);
    const usage = await this.prisma.usage.aggregate({
      where: {
        businessId,
        metric: entitlement.featureCode,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
      },
      _sum: { quantity: true },
    });

    return usage._sum.quantity ?? 0;
  }

  private resolvePeriod(period: EntitlementPeriod | null): PeriodRange {
    if (period === EntitlementPeriod.YEARLY) {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));

      return { periodStart: start, periodEnd: end };
    }

    if (period === EntitlementPeriod.LIFETIME) {
      return {
        periodStart: new Date(0),
        periodEnd: new Date('9999-12-31T23:59:59.999Z'),
      };
    }

    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    return { periodStart: start, periodEnd: end };
  }
}
