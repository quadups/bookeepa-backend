import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageChannel } from '@prisma/client';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;

  @ApiProperty({ enum: [MessageChannel.WHATSAPP, MessageChannel.SMS] })
  @IsIn([MessageChannel.WHATSAPP, MessageChannel.SMS])
  channel!: MessageChannel;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @MaxLength(32)
  recipientPhone!: string;

  @ApiProperty({ example: 'Hello Ada, this is a reminder for your invoice.' })
  @IsString()
  @MaxLength(2000)
  messageBody!: string;

  @ApiPropertyOptional({ example: 'Invoice' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
