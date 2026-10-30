import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { AuthenticatedUser } from './types/authenticated-user.type';

const PASSWORD_RESET_PURPOSE = 'password_reset';
const PASSWORD_RESET_EXPIRES_IN = '1h';

export type LoginResult = {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        success: false,
        message: 'Account is disabled',
        code: 'AUTH_FORBIDDEN',
      });
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = await this.signAccessToken(user);

    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  async validateJwtPayload(
    payload: JwtPayload,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid or expired token',
        code: 'AUTH_UNAUTHORIZED',
      });
    }

    return this.toAuthenticatedUser(user);
  }

  /** Toujours silencieux côté réponse — évite l'énumération d'emails. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return;
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id, purpose: PASSWORD_RESET_PURPOSE },
      { expiresIn: PASSWORD_RESET_EXPIRES_IN },
    );

    const frontendBase =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const resetUrl = `${frontendBase.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    console.log(`[auth] Password reset link for ${user.email}: ${resetUrl}`);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    let payload: JwtPayload & { purpose?: string };

    try {
      payload = await this.jwtService.verifyAsync<
        JwtPayload & { purpose?: string }
      >(dto.token);
    } catch {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'AUTH_RESET_TOKEN_INVALID',
      });
    }

    if (payload.purpose !== PASSWORD_RESET_PURPOSE || !payload.sub) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'AUTH_RESET_TOKEN_INVALID',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'AUTH_RESET_TOKEN_INVALID',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  private toPublicUser(user: User): LoginResult['user'] {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
