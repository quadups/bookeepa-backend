import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MessageQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;
}
