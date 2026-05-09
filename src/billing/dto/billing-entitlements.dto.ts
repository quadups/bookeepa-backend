import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EntitlementEnforcement,
  EntitlementPeriod,
  PlanCode,
  PricingRegionTier,
} from '@prisma/client';
import { IsUUID } from 'class-validator';

export class BillingEntitlementsQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;
}

export class BillingPlanSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: PlanCode })
  code!: PlanCode;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: PricingRegionTier })
  regionTier!: PricingRegionTier;
}

export class FeatureEntitlementDto {
  @ApiProperty({ example: 'TRANSACTIONS' })
  code!: string;

  @ApiProperty({ example: 'Transactions' })
  name!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiPropertyOptional({ example: 300, nullable: true })
  limit!: number | null;

  @ApiPropertyOptional({ enum: EntitlementPeriod, nullable: true })
  period!: EntitlementPeriod | null;

  @ApiProperty({ enum: EntitlementEnforcement })
  enforcement!: EntitlementEnforcement;

  @ApiProperty({ example: 42 })
  used!: number;

  @ApiPropertyOptional({ example: 258, nullable: true })
  remaining!: number | null;
}

export class BillingEntitlementsResponseDto {
  @ApiProperty()
  businessId!: string;

  @ApiProperty({ type: BillingPlanSummaryDto })
  plan!: BillingPlanSummaryDto;

  @ApiProperty({ type: FeatureEntitlementDto, isArray: true })
  features!: FeatureEntitlementDto[];
}
