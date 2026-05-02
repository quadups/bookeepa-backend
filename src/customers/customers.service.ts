import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
  ) {}

  async create(userId: string, dto: CreateCustomerDto): Promise<Customer> {
    await this.tenancyService.assertBusinessMember(userId, dto.businessId);

    return this.prisma.customer.create({
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
  }

  async list(userId: string, businessId: string): Promise<Customer[]> {
    await this.tenancyService.assertBusinessMember(userId, businessId);

    return this.prisma.customer.findMany({
      where: { businessId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
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
