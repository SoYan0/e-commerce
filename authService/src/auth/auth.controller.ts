import { Controller, Post, Body, Patch, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpResetPasswordDto } from './dto/verify-otp-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('register/admin')
  async registerAdmin(@Body() dto: RegisterDto) {
    return await this.authService.registerAdmin(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers() headers: Record<string, string>,
  ) {
    const mockReq = {
      headers,
      ip: headers['x-forwarded-for'] || 'unknown',
    } as Request;
    return await this.authService.login(dto, mockReq);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return await this.authService.logout(dto.refreshToken);
  }

  @Post('refresh')
  async refresh(@Body() dto: LogoutDto) {
    return await this.authService.refresh(dto.refreshToken);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyEmail(dto.otp, dto.email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Post('verify-otp-reset-password')
  async verifyOtpForResetPassword(@Body() dto: VerifyOtpResetPasswordDto) {
    return await this.authService.verifyOtpForResetPassword(dto.email, dto.otp);
  }

  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.email, dto.newPassword);
  }
}
