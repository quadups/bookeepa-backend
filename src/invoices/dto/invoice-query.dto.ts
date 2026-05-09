import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CursorPaginationQueryDto } from '../../common/dto/pagination.dto';

export class InvoiceQueryDto extends CursorPaginationQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
