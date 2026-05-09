import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Transaction } from '@prisma/client';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginatedResult } from '../common/dto/pagination.dto';
import type { RequestUser } from '../common/types/request-user';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth('Bearer')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a bookkeeping transaction' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Optional retry key. Reusing the same key with the same body returns the original response.',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<Transaction> {
    return this.transactionsService.create(user.id, dto, idempotencyKey);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions for a business' })
  @ApiPaginatedResponse(TransactionResponseDto)
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedResult<Transaction>> {
    return this.transactionsService.list(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one transaction' })
  @ApiOkResponse({ type: TransactionResponseDto })
  get(
    @CurrentUser() user: RequestUser,
    @Param('id') transactionId: string,
  ): Promise<Transaction> {
    return this.transactionsService.get(user.id, transactionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one transaction' })
  @ApiOkResponse({ type: TransactionResponseDto })
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') transactionId: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(user.id, transactionId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete one transaction' })
  @ApiOkResponse({ type: TransactionResponseDto })
  softDelete(
    @CurrentUser() user: RequestUser,
    @Param('id') transactionId: string,
  ): Promise<Transaction> {
    return this.transactionsService.softDelete(user.id, transactionId);
  }
}
