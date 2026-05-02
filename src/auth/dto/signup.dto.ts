import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Ada' })
  @IsString()
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Okafor' })
  @IsString()
  @MaxLength(80)
  lastName!: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiProperty({ minLength: 8, example: 'correct-horse-42' })
  @IsString()
  @Length(8, 128)
  @Matches(/[A-Za-z]/, { message: 'password must contain a letter' })
  @Matches(/\d/, { message: 'password must contain a number' })
  password!: string;
}
