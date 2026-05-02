import { Injectable } from '@nestjs/common';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenancyService: TenancyService,
  ) {}

  async getDashboard(
    userId: string,
    businessId: string,
  ): Promise<DashboardResponseDto> {
    await this.tenancyService.assertBusinessMember(userId, businessId);

    const [income, expense, recentTransactions] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          businessId,
          type: TransactionType.INCOME,
          status: TransactionStatus.COMPLETED,
          isDeleted: false,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          businessId,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.COMPLETED,
          isDeleted: false,
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { businessId, isDeleted: false },
        orderBy: { transactionDate: 'desc' },
        take: 5,
      }),
    ]);

    const totalIncome = income._sum.amount ?? new Prisma.Decimal(0);
    const totalExpense = expense._sum.amount ?? new Prisma.Decimal(0);
    const netProfit = totalIncome.sub(totalExpense);

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      netProfit: netProfit.toFixed(2),
      recentTransactions,
    };
  }
}
