import { Controller, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/register', dto),
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('register/admin')
  async registerAdmin(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/register/admin', dto),
    );
    return response.data;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/login', dto),
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/logout', { refreshToken }),
    );
    return response.data;
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/refresh', dto),
    );
    return response.data;
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/verify-email', dto),
    );
    return response.data;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/forgot-password', dto),
    );
    return response.data;
  }

  @Public()
  @Post('verify-otp-reset-password')
  async verifyOtpForResetPassword(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.post('http://localhost:3001/auth/verify-otp-reset-password', dto),
    );
    return response.data;
  }

  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() dto: any) {
    const response = await firstValueFrom(
      this.http.patch('http://localhost:3001/auth/reset-password', dto),
    );
    return response.data;
  }
}
