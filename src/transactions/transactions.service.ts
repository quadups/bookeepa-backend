import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CategoryType,
  Prisma,
  Transaction,
  TransactionType,
} from '@prisma/client';
import {
  PaginatedResult,
  resolvePageLimit,
  toPaginatedResult,
} from '../common/dto/pagination.dto';
import { EntitlementsService } from '../billing/entitlements.service';
import { FEATURE_CODES } from '../billing/feature-codes';
import { IdempotencyService } from '../common/idempotency/idempotency.service';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
    private readonly idempotencyService: IdempotencyService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
    idempotencyKey?: string,
  ): Promise<Transaction> {
    return this.idempotencyService.run({
      userId,
      businessId: dto.businessId,
      key: idempotencyKey,
      route: 'POST /api/v1/transactions',
      requestBody: dto,
      handler: () => this.createTransaction(userId, dto),
    });
  }

  private async createTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const business = await this.tenancyService.assertBusinessAccess(
      userId,
      dto.businessId,
    );
    const currency = this.resolveCurrency(dto.currency, business.currency);

    await this.validateReferences(dto.businessId, dto.type, dto);
    await this.entitlementsService.assertWithinQuota(
      dto.businessId,
      FEATURE_CODES.TRANSACTIONS,
      1,
    );

    const transaction = await this.prisma.transaction.create({
      data: {
        businessId: dto.businessId,
        type: dto.type,
        status: dto.status,
        transactionMode: dto.transactionMode,
        amount: this.toDecimalInput(dto.amount),
        currency,
        description: dto.description?.trim(),
        categoryId: dto.categoryId,
        customerId: dto.customerId,
        vendorId: dto.vendorId,
        paymentMethodId: dto.paymentMethodId,
        reference: dto.reference?.trim(),
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : new Date(),
        createdById: userId,
      },
    });

    await this.entitlementsService.recordUsage(
      dto.businessId,
      FEATURE_CODES.TRANSACTIONS,
      1,
    );

    return transaction;
  }

  async list(
    userId: string,
    query: TransactionQueryDto,
  ): Promise<PaginatedResult<Transaction>> {
    await this.tenancyService.assertBusinessMember(userId, query.businessId);
    const limit = resolvePageLimit(query.limit);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        businessId: query.businessId,
        isDeleted: false,
        type: query.type,
        status: query.status,
        transactionDate: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
      },
      orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: limit + 1,
    });

    return toPaginatedResult(transactions, limit);
  }

  async get(userId: string, transactionId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, isDeleted: false },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    await this.tenancyService.assertBusinessMember(
      userId,
      transaction.businessId,
    );

    return transaction;
  }

  async update(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.get(userId, transactionId);
    const business = await this.tenancyService.assertBusinessAccess(
      userId,
      transaction.businessId,
    );
    const nextType = dto.type ?? transaction.type;

    if (dto.currency) {
      this.resolveCurrency(dto.currency, business.currency);
    }

    await this.validateReferences(transaction.businessId, nextType, dto);

    return this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        type: dto.type,
        status: dto.status,
        transactionMode: dto.transactionMode,
        amount:
          dto.amount !== undefined ? this.toDecimalInput(dto.amount) : undefined,
        currency: dto.currency?.trim().toUpperCase(),
        description: dto.description?.trim(),
        categoryId: dto.categoryId,
        customerId: dto.customerId,
        vendorId: dto.vendorId,
        paymentMethodId: dto.paymentMethodId,
        reference: dto.reference?.trim(),
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : undefined,
      },
    });
  }

  async softDelete(userId: string, transactionId: string): Promise<Transaction> {
    const transaction = await this.get(userId, transactionId);

    return this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { isDeleted: true },
    });
  }

  private resolveCurrency(input: string | undefined, businessCurrency: string) {
    const currency = input?.trim().toUpperCase() ?? businessCurrency;

    if (currency !== businessCurrency) {
      throw new BadRequestException(
        'Transactions must use the business currency in the MVP.',
      );
    }

    return currency;
  }

  private toDecimalInput(value: number): Prisma.Decimal | string {
    return new Prisma.Decimal(value.toString());
  }

  private async validateReferences(
    businessId: string,
    transactionType: TransactionType,
    dto: Pick<
      CreateTransactionDto | UpdateTransactionDto,
      'categoryId' | 'customerId' | 'vendorId' | 'paymentMethodId'
    >,
  ): Promise<void> {
    await Promise.all([
      dto.categoryId
        ? this.assertCategoryMatches(businessId, dto.categoryId, transactionType)
        : Promise.resolve(),
      dto.customerId
        ? this.assertCustomerMatches(businessId, dto.customerId)
        : Promise.resolve(),
      dto.vendorId
        ? this.assertVendorMatches(businessId, dto.vendorId)
        : Promise.resolve(),
      dto.paymentMethodId
        ? this.assertPaymentMethodMatches(businessId, dto.paymentMethodId)
        : Promise.resolve(),
    ]);
  }

  private async assertCategoryMatches(
    businessId: string,
    categoryId: string,
    transactionType: TransactionType,
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, businessId },
    });

    if (!category) {
      throw new BadRequestException('Category does not belong to this business.');
    }

    const expectedType =
      transactionType === TransactionType.INCOME
        ? CategoryType.INCOME
        : CategoryType.EXPENSE;

    if (category.type !== expectedType) {
      throw new BadRequestException(
        'Category type must match transaction type.',
      );
    }
  }

  private async assertCustomerMatches(
    businessId: string,
    customerId: string,
  ): Promise<void> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, businessId, isDeleted: false },
      select: { id: true },
    });

    if (!customer) {
      throw new BadRequestException('Customer does not belong to this business.');
    }
  }

  private async assertVendorMatches(
    businessId: string,
    vendorId: string,
  ): Promise<void> {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: vendorId, businessId, isDeleted: false },
      select: { id: true },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor does not belong to this business.');
    }
  }

  private async assertPaymentMethodMatches(
    businessId: string,
    paymentMethodId: string,
  ): Promise<void> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, businessId },
      select: { id: true },
    });

    if (!paymentMethod) {
      throw new BadRequestException(
        'Payment method does not belong to this business.',
      );
    }
  }
}
