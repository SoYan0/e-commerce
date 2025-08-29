import { IsEmail, IsNumber, Min } from 'class-validator';

export class VerifyOtpResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNumber()
  @Min(100000)
  otp: number;
}
