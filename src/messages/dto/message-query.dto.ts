import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CursorPaginationQueryDto } from '../../common/dto/pagination.dto';

export class MessageQueryDto extends CursorPaginationQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;
}
