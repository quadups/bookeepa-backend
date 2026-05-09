import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingInterval, PlanCode, PricingRegionTier } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class PricingPlanQueryDto {
  @ApiPropertyOptional({ enum: PricingRegionTier })
  @IsOptional()
  @IsEnum(PricingRegionTier)
  regionTier?: PricingRegionTier;
}

export class ResolvePricingQueryDto {
  @ApiPropertyOptional({ enum: PlanCode, default: PlanCode.STARTER })
  @IsOptional()
  @IsEnum(PlanCode)
  planCode?: PlanCode;
}

export class ResolvedPricingDto {
  @ApiProperty({ example: 'NG' })
  countryCode!: string;

  @ApiProperty({ enum: PricingRegionTier })
  pricingRegion!: PricingRegionTier;

  @ApiProperty({ enum: PlanCode })
  pricingTier!: PlanCode;

  @ApiProperty({ example: 'NGN' })
  billingCurrency!: string;

  @ApiProperty({ example: '3000.00' })
  localizedPrice!: string;

  @ApiProperty({ example: true })
  isFallback!: boolean;
}

export class PricingPlanDto {
  @ApiProperty({ enum: PlanCode })
  code!: PlanCode;

  @ApiProperty({ example: 'Starter' })
  name!: string;

  @ApiProperty({ enum: PricingRegionTier })
  regionTier!: PricingRegionTier;

  @ApiProperty({ enum: BillingInterval })
  billingInterval!: BillingInterval;

  @ApiProperty({ example: 'NGN' })
  currency!: string;

  @ApiProperty({ example: '3000.00' })
  price!: string;

  @ApiProperty({ type: [String] })
  features!: string[];
}
