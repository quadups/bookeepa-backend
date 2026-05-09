import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CursorPaginationQueryDto } from '../../common/dto/pagination.dto';

export class CustomerQueryDto extends CursorPaginationQueryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;
}
