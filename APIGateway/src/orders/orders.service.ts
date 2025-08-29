import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  private readonly baseUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

  constructor(private readonly httpService: HttpService) {}

  async createOrder(orderData: any, userId: number) {
    try {
      // Transform the request data to match order service expectations
      const transformedOrderData = {
        userId: userId,
        items: orderData.products.map((product: any) => ({
          productId: parseInt(product.productId),
          quantity: product.quantity
        })),
        shippingAddress: {
          address: orderData.shippingAddress
        },
        shippingCost: orderData.shippingCost || 0,
        discount: orderData.discount || 0
      };

      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/orders`, transformedOrderData),
      );
      return data;
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to create order',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getOrder(id: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/orders/${id}`),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch order',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async listOrdersByUser(userId: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/orders`, {
          params: { userId },
        })
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch orders',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async updateOrderStatus(id: string, status: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/orders/${id}/status`, {
          orderStatus: status,
        })
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to update order status',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async updatePaymentStatus(id: string, status: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/orders/${id}/payment`, {
          paymentStatus: status,
        })
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to update payment status',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async cancelOrder(id: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/orders/${id}/cancel`)
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to cancel order',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
