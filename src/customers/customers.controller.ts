import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Customer } from '@prisma/client';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginatedResult } from '../common/dto/pagination.dto';
import type { RequestUser } from '../common/types/request-user';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';

@ApiTags('customers')
@ApiBearerAuth('Bearer')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a customer for a business' })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customers for a business' })
  @ApiPaginatedResponse(CustomerResponseDto)
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: CustomerQueryDto,
  ): Promise<PaginatedResult<Customer>> {
    return this.customersService.list(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one customer' })
  @ApiOkResponse({ type: CustomerResponseDto })
  get(
    @CurrentUser() user: RequestUser,
    @Param('id') customerId: string,
  ): Promise<Customer> {
    return this.customersService.get(user.id, customerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one customer' })
  @ApiOkResponse({ type: CustomerResponseDto })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.update(user.id, customerId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete one customer' })
  @ApiOkResponse({ type: CustomerResponseDto })
  softDelete(
    @CurrentUser() user: RequestUser,
    @Param('id') customerId: string,
  ): Promise<Customer> {
    return this.customersService.softDelete(user.id, customerId);
  }
}
