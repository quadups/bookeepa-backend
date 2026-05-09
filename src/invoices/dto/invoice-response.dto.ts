import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: '2.00' })
  quantity!: string;

  @ApiProperty({ example: '25000.00' })
  unitPrice!: string;

  @ApiProperty({ example: '50000.00' })
  total!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class InvoiceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  businessId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  invoiceNumber!: string;

  @ApiProperty({ enum: InvoiceStatus })
  status!: InvoiceStatus;

  @ApiProperty({ example: '50000.00' })
  totalAmount!: string;

  @ApiProperty({ example: 'NGN' })
  currency!: string;

  @ApiProperty()
  dueDate!: Date;

  @ApiProperty()
  issuedDate!: Date;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdById!: string;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty({ type: InvoiceItemResponseDto, isArray: true })
  items!: InvoiceItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
