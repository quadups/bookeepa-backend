import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
  ) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    await this.tenancyService.assertBusinessMember(userId, dto.businessId);

    return this.prisma.category.create({
      data: {
        businessId: dto.businessId,
        name: dto.name.trim(),
        type: dto.type,
        color: dto.color?.trim(),
        icon: dto.icon?.trim(),
      },
    });
  }

  async list(userId: string, query: CategoryQueryDto): Promise<Category[]> {
    await this.tenancyService.assertBusinessMember(userId, query.businessId);

    return this.prisma.category.findMany({
      where: {
        businessId: query.businessId,
        type: query.type,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }
}
