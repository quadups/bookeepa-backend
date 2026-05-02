import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanCode, PricingRegionTier } from '@prisma/client';

export class BusinessResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  industry?: string | null;

  @ApiProperty({ example: 'NGN' })
  currency!: string;

  @ApiProperty({ example: 'NG' })
  country!: string;

  @ApiProperty()
  ownerId!: string;

  @ApiPropertyOptional({ enum: PricingRegionTier })
  pricingRegion?: PricingRegionTier | null;

  @ApiPropertyOptional({ enum: PlanCode })
  pricingTier?: PlanCode | null;

  @ApiPropertyOptional({ example: 'NGN' })
  billingCurrency?: string | null;

  @ApiPropertyOptional({ example: '3000.00' })
  localizedPrice?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
