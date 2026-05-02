import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CustomerQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;
}
