import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user';
import { BusinessesService } from './businesses.service';
import { BusinessResponseDto } from './dto/business-response.dto';
import { CreateBusinessDto } from './dto/create-business.dto';

@ApiTags('businesses')
@ApiBearerAuth('Bearer')
@Controller('business')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a business and make the user OWNER' })
  @ApiCreatedResponse({ type: BusinessResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateBusinessDto,
  ): Promise<BusinessResponseDto> {
    return this.businessesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List businesses the user belongs to' })
  @ApiOkResponse({ type: BusinessResponseDto, isArray: true })
  list(@CurrentUser() user: RequestUser): Promise<BusinessResponseDto[]> {
    return this.businessesService.listForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one business by id' })
  @ApiOkResponse({ type: BusinessResponseDto })
  get(
    @CurrentUser() user: RequestUser,
    @Param('id') businessId: string,
  ): Promise<BusinessResponseDto> {
    return this.businessesService.getById(user.id, businessId);
  }
}
