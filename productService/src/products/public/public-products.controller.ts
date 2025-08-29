import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GetAllProductsQueryDto } from '../dto/get-all-products-query.dto';
import { PublicProductsService } from './public-products.service';
import { SearchFiltersDto } from '../dto/search-filters.dto';
import { S3Service } from 'src/s3/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class PublicProductsController {
  constructor(
    private readonly publicProductsService: PublicProductsService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  async getAllProducts(@Query() query: GetAllProductsQueryDto) {
    return await this.publicProductsService.getAllProducts(
      query.page,
      query.limit,
    );
  }

  @Get('search')
  async searchProducts(@Query() filter: SearchFiltersDto) {
    return await this.publicProductsService.searchProducts(filter);
  }

  @Get('categories')
  async getProductsByCategories(@Body('categories') categories: string[]) {
    return await this.publicProductsService.getProductsByCategories(categories);
  }

  @Get('bulk')
  async getProductsByIds(@Query('ids') ids: string) {
    if (!ids) {
      return [];
    }
    const idArray = ids.split(',').map(id => id.trim()).filter(id => id.length > 0);
    return await this.publicProductsService.getProductsByIds(idArray);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return await this.publicProductsService.getProductById(id);
  }
}
