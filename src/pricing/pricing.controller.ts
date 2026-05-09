import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import {
  PricingPlanDto,
  PricingPlanQueryDto,
  ResolvedPricingDto,
  ResolvePricingQueryDto,
} from './dto/pricing.dto';
import { PricingService } from './pricing.service';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List localized pricing plans' })
  @ApiOkResponse({ type: PricingPlanDto, isArray: true })
  listPlans(@Query() query: PricingPlanQueryDto): Promise<PricingPlanDto[]> {
    return this.pricingService.listPlans(query.regionTier);
  }

  @Public()
  @Get('countries/:countryCode')
  @ApiOperation({ summary: 'Resolve onboarding pricing for a country' })
  @ApiParam({ name: 'countryCode', example: 'NG' })
  @ApiOkResponse({ type: ResolvedPricingDto })
  resolveCountryPricing(
    @Param('countryCode') countryCode: string,
    @Query() query: ResolvePricingQueryDto,
  ): Promise<ResolvedPricingDto> {
    return this.pricingService.resolvePricingForCountry(
      countryCode,
      query.planCode,
    );
  }
}
