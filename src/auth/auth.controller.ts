import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { RequestUser } from '../common/types/request-user';
import { AuthRequestMetadata, AuthService } from './auth.service';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto, RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import type { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Create a user account' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  signup(
    @Body() dto: SignupDto,
    @Req() request: Request,
  ): Promise<AuthResponseDto> {
    return this.authService.signup(dto, this.getRequestMetadata(request));
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
  ): Promise<AuthResponseDto> {
    return this.authService.login(dto, this.getRequestMetadata(request));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate a refresh token and issue a new access token' })
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<AuthResponseDto> {
    return this.authService.refresh(dto, this.getRequestMetadata(request));
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke a refresh token session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  logout(@Body() dto: RefreshTokenDto): Promise<LogoutResponseDto> {
    return this.authService.logout(dto);
  }

  @Get('me')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Return the current authenticated user' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUser() user: RequestUser): Promise<AuthUserDto> {
    return this.authService.getMe(user.id);
  }

  private getRequestMetadata(request: Request): AuthRequestMetadata {
    const userAgentHeader = request.headers['user-agent'];

    return {
      userAgent: Array.isArray(userAgentHeader)
        ? userAgentHeader.join(',')
        : userAgentHeader,
      ipAddress: request.ip,
    };
  }
}
