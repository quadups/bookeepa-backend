import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TransactionMode,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  businessId!: string;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  status!: TransactionStatus;

  @ApiPropertyOptional({ enum: TransactionMode })
  transactionMode?: TransactionMode | null;

  @ApiProperty({ example: '12500.00' })
  amount!: string;

  @ApiProperty({ example: 'NGN' })
  currency!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  categoryId?: string | null;

  @ApiPropertyOptional()
  customerId?: string | null;

  @ApiPropertyOptional()
  vendorId?: string | null;

  @ApiPropertyOptional()
  paymentMethodId?: string | null;

  @ApiPropertyOptional()
  reference?: string | null;

  @ApiProperty()
  transactionDate!: Date;

  @ApiProperty()
  createdById!: string;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
