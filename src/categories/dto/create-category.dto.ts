import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;

  @ApiProperty({ example: 'Product sales' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type!: CategoryType;

  @ApiPropertyOptional({ example: '#2563eb' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  color?: string;

  @ApiPropertyOptional({ example: 'shopping-bag' })
  @IsOptional()
  @IsString()
  @MaxLength(48)
  icon?: string;
}
