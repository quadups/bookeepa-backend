import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Transaction } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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
  @ApiCreatedResponse({ type: TransactionResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions for a business' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: TransactionQueryDto,
  ): Promise<Transaction[]> {
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
