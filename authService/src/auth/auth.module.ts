import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { JwtModule } from '@nestjs/jwt';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'auth-service-jwt-secret-2024',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    MailerModule,
    SessionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
