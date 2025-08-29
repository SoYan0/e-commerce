import { Body, Controller, Delete, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { AdminProductsService } from './admin-products.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.adminProductsService.createProduct(dto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateProduct(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.adminProductsService.updateProduct(id, dto, file);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return await this.adminProductsService.deleteProduct(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { filename: string; id: number },
  ) {
    return await this.adminProductsService.uploadFile(file, body.id);
  }
}
