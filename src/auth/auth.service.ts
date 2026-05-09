import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { AppConfigService } from '../config/config.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto, RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

export interface AuthRequestMetadata {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(
    dto: SignupDto,
    metadata: AuthRequestMetadata,
  ): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim(),
        passwordHash,
      },
    });

    return this.buildAuthResponse(user, metadata);
  }

  async login(
    dto: LoginDto,
    metadata: AuthRequestMetadata,
  ): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await this.passwordService.verify(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(updatedUser, metadata);
  }

  async refresh(
    dto: RefreshTokenDto,
    metadata: AuthRequestMetadata,
  ): Promise<AuthResponseDto> {
    const refreshTokenHash = this.tokenService.hashRefreshToken(
      dto.refreshToken,
    );
    const session = await this.prisma.authSession.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResponse(session.user, metadata);
  }

  async logout(dto: RefreshTokenDto): Promise<LogoutResponseDto> {
    const refreshTokenHash = this.tokenService.hashRefreshToken(
      dto.refreshToken,
    );

    const result = await this.prisma.authSession.updateMany({
      where: {
        refreshTokenHash,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { revoked: result.count > 0 };
  }

  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return this.toAuthUser(user);
  }

  private async buildAuthResponse(
    user: User,
    metadata: AuthRequestMetadata,
  ): Promise<AuthResponseDto> {
    const refreshToken = this.tokenService.generateRefreshToken();

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.tokenService.hashRefreshToken(refreshToken),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt: this.refreshTokenExpiry(),
      },
    });

    return {
      accessToken: this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email,
      }),
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  private refreshTokenExpiry(): Date {
    const days = this.config.refreshTokenExpiresInDays;

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private toAuthUser(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  }
}
