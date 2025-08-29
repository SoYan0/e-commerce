import { IsEmail, IsNumber, Min } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  @Min(100000)
  otp: number;
}
