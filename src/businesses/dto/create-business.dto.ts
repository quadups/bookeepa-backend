import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanCode } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Ada Stores' })
  @IsString()
  @MaxLength(140)
  name!: string;

  @ApiPropertyOptional({ example: 'Retail' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  industry?: string;

  @ApiProperty({ example: 'NGN', minLength: 3, maxLength: 3 })
  @IsString()
  @Length(3, 3)
  currency!: string;

  @ApiProperty({ example: 'NG', minLength: 2, maxLength: 2 })
  @IsString()
  @Length(2, 2)
  country!: string;

  @ApiPropertyOptional({ enum: PlanCode, default: PlanCode.STARTER })
  @IsOptional()
  @IsEnum(PlanCode)
  pricingTier?: PlanCode;
}
