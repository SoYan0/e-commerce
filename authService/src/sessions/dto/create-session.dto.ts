import { IsNumber, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsNumber()
  userId: number;

  @IsString()
  refreshToken: string;

  @IsString()
  userAgent?: string;

  @IsString()
  ipAddress?: string | string[] | undefined;

  expiresAt?: Date;
}
