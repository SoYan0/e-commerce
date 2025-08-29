import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @Transform(({ value }) => {
    return typeof value === 'string' ? parseFloat(value) : value;
  })
  @IsNumber()
  price: number;

  @IsOptional()
  @Transform(({ value }) => {
    return typeof value === 'string' ? parseFloat(value) : value;
  })
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @Transform(({ value }) => {
    return typeof value === 'string' ? parseFloat(value) : value;
  })
  @IsNumber()
  discountedPrice?: number;

  @IsOptional()
  @IsDate()
  discountExpiresAt?: Date;

  @Transform(({ value }) => {
    return typeof value === 'string' ? parseFloat(value) : value;
  })
  @IsNumber()
  stock: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  categories: string[];
}
