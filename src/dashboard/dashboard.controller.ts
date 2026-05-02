import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('dashboard')
@ApiBearerAuth('Bearer')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':businessId')
  @ApiOperation({ summary: 'Compute dashboard totals for a business' })
  @ApiOkResponse({ type: DashboardResponseDto })
  getDashboard(
    @CurrentUser() user: RequestUser,
    @Param('businessId') businessId: string,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(user.id, businessId);
  }
}
