import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user';
import { TenancyService } from '../common/tenancy/tenancy.service';
import {
  BillingEntitlementsQueryDto,
  BillingEntitlementsResponseDto,
} from './dto/billing-entitlements.dto';
import { EntitlementsService } from './entitlements.service';

@ApiTags('billing')
@ApiBearerAuth('Bearer')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly entitlementsService: EntitlementsService,
    private readonly tenancyService: TenancyService,
  ) {}

  @Get('entitlements')
  @ApiOperation({
    summary: 'Return the active plan and feature entitlements for a business',
  })
  @ApiOkResponse({ type: BillingEntitlementsResponseDto })
  async getEntitlements(
    @CurrentUser() user: RequestUser,
    @Query() query: BillingEntitlementsQueryDto,
  ): Promise<BillingEntitlementsResponseDto> {
    await this.tenancyService.assertBusinessMember(user.id, query.businessId);

    return this.entitlementsService.getBusinessEntitlements(query.businessId);
  }
}
