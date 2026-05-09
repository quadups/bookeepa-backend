import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageChannel, MessageDirection, MessageStatus } from '@prisma/client';

export class MessageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  businessId!: string;

  @ApiProperty({ enum: MessageDirection })
  direction!: MessageDirection;

  @ApiProperty({ enum: MessageChannel })
  channel!: MessageChannel;

  @ApiProperty()
  recipientPhone!: string;

  @ApiProperty()
  messageBody!: string;

  @ApiProperty({ enum: MessageStatus })
  status!: MessageStatus;

  @ApiPropertyOptional()
  referenceType?: string | null;

  @ApiPropertyOptional()
  referenceId?: string | null;

  @ApiPropertyOptional()
  errorMessage?: string | null;

  @ApiPropertyOptional()
  createdById?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
