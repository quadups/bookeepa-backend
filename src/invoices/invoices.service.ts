import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, InvoiceItem, Prisma } from '@prisma/client';
import {
  PaginatedResult,
  resolvePageLimit,
  toPaginatedResult,
} from '../common/dto/pagination.dto';
import { EntitlementsService } from '../billing/entitlements.service';
import { FEATURE_CODES } from '../billing/feature-codes';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

export type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async create(userId: string, dto: CreateInvoiceDto): Promise<InvoiceWithItems> {
    const business = await this.tenancyService.assertBusinessAccess(
      userId,
      dto.businessId,
    );

    await this.assertCustomerBelongsToBusiness(dto.businessId, dto.customerId);
    await this.entitlementsService.assertWithinQuota(
      dto.businessId,
      FEATURE_CODES.INVOICES,
      1,
    );

    const invoiceItems = dto.items.map((item) => this.prepareItem(item));
    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum.add(item.total),
      new Prisma.Decimal(0),
    );
    const invoiceNumber = await this.generateInvoiceNumber(dto.businessId);

    const invoice = await this.prisma.invoice.create({
      data: {
        businessId: dto.businessId,
        customerId: dto.customerId,
        invoiceNumber,
        status: dto.status,
        totalAmount,
        currency: business.currency,
        dueDate: new Date(dto.dueDate),
        issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : new Date(),
        notes: dto.notes?.trim(),
        createdById: userId,
        items: {
          create: invoiceItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    await this.entitlementsService.recordUsage(
      dto.businessId,
      FEATURE_CODES.INVOICES,
      1,
    );

    return invoice;
  }

  async list(
    userId: string,
    query: InvoiceQueryDto,
  ): Promise<PaginatedResult<InvoiceWithItems>> {
    await this.tenancyService.assertBusinessMember(userId, query.businessId);
    const limit = resolvePageLimit(query.limit);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        businessId: query.businessId,
        status: query.status,
        isDeleted: false,
      },
      include: { items: true },
      orderBy: [{ issuedDate: 'desc' }, { id: 'desc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: limit + 1,
    });

    return toPaginatedResult(invoices, limit);
  }

  async get(userId: string, invoiceId: string): Promise<InvoiceWithItems> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, isDeleted: false },
      include: { items: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }

    await this.tenancyService.assertBusinessMember(userId, invoice.businessId);

    return invoice;
  }

  async update(
    userId: string,
    invoiceId: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceWithItems> {
    const invoice = await this.get(userId, invoiceId);

    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes?.trim(),
      },
      include: { items: true },
    });
  }

  private prepareItem(item: CreateInvoiceItemDto) {
    const quantity = new Prisma.Decimal(item.quantity.toString());
    const unitPrice = new Prisma.Decimal(item.unitPrice.toString());
    const total = quantity.mul(unitPrice);

    return {
      name: item.name.trim(),
      quantity,
      unitPrice,
      total,
    };
  }

  private async assertCustomerBelongsToBusiness(
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

  private async generateInvoiceNumber(businessId: string): Promise<string> {
    const now = new Date();
    const datePart = [
      now.getUTCFullYear(),
      `${now.getUTCMonth() + 1}`.padStart(2, '0'),
      `${now.getUTCDate()}`.padStart(2, '0'),
    ].join('');
    const count = await this.prisma.invoice.count({
      where: { businessId },
    });

    return `INV-${datePart}-${`${count + 1}`.padStart(5, '0')}`;
  }
}
