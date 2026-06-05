import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { AuthenticatedUser } from './types/authenticated-user.type';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);

    return {
      success: true,
      data,
      message: 'Login successful',
    };
  }

  @Public()
  @Post('logout')
  logout() {
    return {
      success: true,
      data: null,
      message: 'Logout successful',
    };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);

    return {
      success: true,
      data: null,
      message: 'If this email exists, a reset link has been sent.',
    };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);

    return {
      success: true,
      data: null,
      message: 'Password updated successfully',
    };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      message: 'Authenticated user retrieved',
    };
  }
}
