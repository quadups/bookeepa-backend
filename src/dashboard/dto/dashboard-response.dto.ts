import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponseDto {
  @ApiProperty({ example: '100000.00' })
  totalIncome!: string;

  @ApiProperty({ example: '35000.00' })
  totalExpense!: string;

  @ApiProperty({ example: '65000.00' })
  netProfit!: string;

  @ApiProperty({ type: Object, isArray: true })
  recentTransactions!: unknown[];
}
