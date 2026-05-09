import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginatedResult } from '../common/dto/pagination.dto';
import type { RequestUser } from '../common/types/request-user';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService, InvoiceWithItems } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth('Bearer')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice from line items' })
  @ApiCreatedResponse({ type: InvoiceResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceWithItems> {
    return this.invoicesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices for a business' })
  @ApiPaginatedResponse(InvoiceResponseDto)
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: InvoiceQueryDto,
  ): Promise<PaginatedResult<InvoiceWithItems>> {
    return this.invoicesService.list(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one invoice' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  get(
    @CurrentUser() user: RequestUser,
    @Param('id') invoiceId: string,
  ): Promise<InvoiceWithItems> {
    return this.invoicesService.get(user.id, invoiceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice status or due date' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') invoiceId: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceWithItems> {
    return this.invoicesService.update(user.id, invoiceId, dto);
  }
}
