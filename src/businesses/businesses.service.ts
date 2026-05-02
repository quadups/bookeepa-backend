import { Injectable } from '@nestjs/common';
import { Business, BusinessRole, PlanCode } from '@prisma/client';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly tenancyService: TenancyService,
  ) {}

  async create(
    userId: string,
    dto: CreateBusinessDto,
  ): Promise<BusinessResponseDto> {
    const country = dto.country.trim().toUpperCase();
    const currency = dto.currency.trim().toUpperCase();
    const pricing = await this.pricingService.resolvePricingForCountry(
      country,
      dto.pricingTier ?? PlanCode.STARTER,
    );

    const business = await this.prisma.$transaction(async (tx) => {
      const createdBusiness = await tx.business.create({
        data: {
          name: dto.name.trim(),
          industry: dto.industry?.trim(),
          currency,
          country,
          ownerId: userId,
          pricingRegion: pricing.pricingRegion,
          pricingTier: pricing.pricingTier,
          billingCurrency: pricing.billingCurrency,
          localizedPrice: pricing.localizedPrice,
          pricingLockedAt: new Date(),
          members: {
            create: {
              userId,
              role: BusinessRole.OWNER,
            },
          },
        },
      });

      await tx.activityLog.create({
        data: {
          businessId: createdBusiness.id,
          userId,
          action: 'BUSINESS_CREATED',
          entityType: 'Business',
          entityId: createdBusiness.id,
          metadata: {
            pricingRegion: pricing.pricingRegion,
            pricingTier: pricing.pricingTier,
            billingCurrency: pricing.billingCurrency,
            localizedPrice: pricing.localizedPrice,
            pricingFallbackUsed: pricing.isFallback,
          },
        },
      });

      return createdBusiness;
    });

    return this.toBusinessResponse(business);
  }

  async listForUser(userId: string): Promise<BusinessResponseDto[]> {
    const businesses = await this.prisma.business.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return businesses.map((business) => this.toBusinessResponse(business));
  }

  async getById(
    userId: string,
    businessId: string,
  ): Promise<BusinessResponseDto> {
    const business = await this.tenancyService.assertBusinessAccess(
      userId,
      businessId,
    );

    return this.toBusinessResponse(business);
  }

  private toBusinessResponse(business: Business): BusinessResponseDto {
    return {
      id: business.id,
      name: business.name,
      industry: business.industry,
      currency: business.currency,
      country: business.country,
      ownerId: business.ownerId,
      pricingRegion: business.pricingRegion,
      pricingTier: business.pricingTier,
      billingCurrency: business.billingCurrency,
      localizedPrice: business.localizedPrice?.toFixed(2) ?? null,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    };
  }
}
