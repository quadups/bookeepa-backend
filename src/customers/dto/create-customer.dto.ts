import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsUUID()
  businessId!: string;

  @ApiProperty({ example: 'Ifeanyi Foods' })
  @IsString()
  @MaxLength(140)
  name!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @MaxLength(32)
  phone!: string;

  @ApiPropertyOptional({ example: 'owner@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  whatsappOptIn?: boolean;
}
