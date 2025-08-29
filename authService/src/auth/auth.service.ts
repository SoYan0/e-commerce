import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import Redis from 'ioredis';
import { MailerService } from 'src/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from 'src/sessions/sessions.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  async register(dto: RegisterDto) {
    const isEmailAvailable = await this.usersService.isEmailAvailable(
      dto.email,
    );

    if (!isEmailAvailable) {
      throw new BadRequestException('Email is already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
    });

    if (!user) {
      throw new BadRequestException('User registration failed');
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    await this.redis.set('otp', otp, 'EX', 300);

    await this.mailerService.sendEmail(
      dto.email,
      'Email Verification',
      'email-verification',
      `Your OTP is ${otp}. It is valid for 5 minutes.`,
    );
    return { message: 'registered successfully' };
  }

  async registerAdmin(dto: RegisterDto) {
    const isEmailAvailable = await this.usersService.isEmailAvailable(
      dto.email,
    );
    if (!isEmailAvailable) {
      throw new BadRequestException('Email is already taken');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      ...dto,
      password: hashedPassword,
      role: 'admin',
    });
    if (!user) {
      throw new BadRequestException('User registration failed');
    }
    return { message: 'admin registered successfully' };
  }

  async verifyEmail(otp: number, email: string) {
    const storedOtp = await this.redis.get('otp');

    if (!storedOtp) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (parseInt(storedOtp) !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.redis.del('otp'); // Clear the OTP after verification

    const activateUser = await this.usersService.activateUserByEmail(email);

    if (!activateUser) {
      throw new BadRequestException('User activation failed');
    }

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto, req: Request) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException('Invalid email or password');
    }

    const accessToken = this.jwtService.sign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '1h' },
    );

    const refreshToken = this.jwtService.sign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const session = await this.sessionsService.createSession({
      userId: user.id,
      refreshToken: hashedRefreshToken,
      userAgent: req.headers['user-agent'] as string,
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    const session =
      await this.sessionsService.findSessionByRefreshToken(refreshToken);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionsService.deleteSession(session.id);

    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verify(refreshToken);

    const session =
      await this.sessionsService.findSessionByRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const newAccessToken = this.jwtService.sign(
      { userId: payload.userId, email: payload.email, role: payload.role },
      { expiresIn: '1h' },
    );

    const newRefreshToken = this.jwtService.sign(
      { userId: payload.userId, email: payload.email, role: payload.role },
      { expiresIn: '7d' },
    );

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    await this.sessionsService.updateSession(session.id, {
      refreshToken: hashedNewRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await this.redis.set(`reset_otp_${email}`, otp, 'EX', 300);

    await this.mailerService.sendEmail(
      email,
      'Password Reset OTP',
      'password-reset',
      `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
    );

    return { message: 'OTP sent to your email' };
  }

  async verifyOtpForResetPassword(email: string, otp: number) {
    const storedOtp = await this.redis.get(`reset_otp_${email}`);

    if (!storedOtp) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (parseInt(storedOtp) !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.redis.del(`reset_otp_${email}`);

    await this.redis.set(`reset_status_${email}`, 'pending', 'EX', 300);

    return { message: 'otp verified' };
  }

  async resetPassword(email: string, newPassword: string) {
    const resetStatus = await this.redis.get(`reset_status_${email}`);

    if (!resetStatus || resetStatus !== 'pending') {
      throw new BadRequestException('Reset password session expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = hashedPassword;
    await this.usersService.updateUser(user);

    await this.redis.del(`reset_otp_${email}`);
    await this.redis.del(`reset_status_${email}`);

    return { message: 'Password reset successfully' };
  }
}
