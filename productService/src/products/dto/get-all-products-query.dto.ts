import { IsNumber } from 'class-validator';

export class GetAllProductsQueryDto {
  page?: number;

  limit?: number;
}
