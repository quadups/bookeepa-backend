import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Business, BusinessMember, BusinessRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  async assertBusinessAccess(
    userId: string,
    businessId: string,
  ): Promise<Business> {
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        members: {
          some: { userId },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found for this user.');
    }

    return business;
  }

  async assertBusinessMember(
    userId: string,
    businessId: string,
  ): Promise<BusinessMember> {
    const member = await this.prisma.businessMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You do not have access to this business.');
    }

    return member;
  }

  async assertBusinessRole(
    userId: string,
    businessId: string,
    allowedRoles: BusinessRole[],
  ): Promise<BusinessMember> {
    const member = await this.assertBusinessMember(userId, businessId);

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Your role cannot perform this action.');
    }

    return member;
  }
}
