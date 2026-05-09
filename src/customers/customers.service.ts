import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '@prisma/client';
import {
  PaginatedResult,
  resolvePageLimit,
  toPaginatedResult,
} from '../common/dto/pagination.dto';
import { EntitlementsService } from '../billing/entitlements.service';
import { FEATURE_CODES } from '../billing/feature-codes';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async create(userId: string, dto: CreateCustomerDto): Promise<Customer> {
    await this.tenancyService.assertBusinessMember(userId, dto.businessId);
    await this.entitlementsService.assertWithinQuota(
      dto.businessId,
      FEATURE_CODES.CUSTOMERS,
      1,
    );

    const customer = await this.prisma.customer.create({
      data: {
        businessId: dto.businessId,
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim().toLowerCase(),
        address: dto.address?.trim(),
        notes: dto.notes?.trim(),
        whatsappOptIn: dto.whatsappOptIn ?? true,
      },
    });

    await this.entitlementsService.recordUsage(
      dto.businessId,
      FEATURE_CODES.CUSTOMERS,
      1,
    );

    return customer;
  }

  async list(
    userId: string,
    query: CustomerQueryDto,
  ): Promise<PaginatedResult<Customer>> {
    await this.tenancyService.assertBusinessMember(userId, query.businessId);
    const limit = resolvePageLimit(query.limit);

    const customers = await this.prisma.customer.findMany({
      where: { businessId: query.businessId, isDeleted: false },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: limit + 1,
    });

    return toPaginatedResult(customers, limit);
  }

  async get(userId: string, customerId: string): Promise<Customer> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, isDeleted: false },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    await this.tenancyService.assertBusinessMember(userId, customer.businessId);

    return customer;
  }

  async update(
    userId: string,
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.get(userId, customerId);

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: dto.name?.trim(),
        phone: dto.phone?.trim(),
        email: dto.email?.trim().toLowerCase(),
        address: dto.address?.trim(),
        notes: dto.notes?.trim(),
        whatsappOptIn: dto.whatsappOptIn,
      },
    });
  }

  async softDelete(userId: string, customerId: string): Promise<Customer> {
    const customer = await this.get(userId, customerId);

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: { isDeleted: true },
    });
  }
}
