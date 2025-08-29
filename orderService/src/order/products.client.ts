import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {
  ProductSnapshot,
  ReserveItemInput,
} from './interfaces/product.interface';

@Injectable()
export class ProductsClient {
  private readonly baseUrl =
    process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

  async getProductsByIds(ids: number[]): Promise<ProductSnapshot[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/products/bulk`, {
        params: { ids: ids.join(',') },
      });
      return data;
    } catch (e) {
      throw new HttpException(
        'Failed to fetch products',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Soft reservation to avoid overselling (optional but recommended)
  async reserveStock(
    items: ReserveItemInput[],
    context: { orderTempId: string },
  ): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/inventory/reserve`, { items, context });
    } catch (e) {
      throw new HttpException('Failed to reserve stock', HttpStatus.CONFLICT);
    }
  }

  async commitStock(orderId: string, items: ReserveItemInput[]): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/inventory/commit`, { orderId, items });
    } catch (e) {
      throw new HttpException('Failed to commit stock', HttpStatus.BAD_GATEWAY);
    }
  }

  async releaseStock(orderTempId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/inventory/release`, { orderTempId });
    } catch (e) {
      // Swallow errors on release; just log in real app
    }
  }
}
