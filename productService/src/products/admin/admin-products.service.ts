import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly s3Service: S3Service,
  ) {}

  async createProduct(dto: CreateProductDto, file?: Express.Multer.File) {
    const product = this.productRepo.create(dto);

    if (dto.discountPercentage) {
      product.discountedPrice = dto.price * (1 - dto.discountPercentage / 100);
    }

    if (file) {
      const fileUrl = await this.s3Service.uploadFile(
        process.env.AWS_S3_BUCKET || 'yansubucket',
        file.originalname,
        file.buffer,
        file.mimetype,
      );
      product.imageUrl = fileUrl;
    }

    await this.productRepo.save(product);

    await this.elasticSearchService.index({
      index: 'products',
      id: product.id.toString(),
      body: { ...product },
    });

    return { message: 'Product created successfully', product };
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      return { message: 'Product not found' };
    }

    Object.assign(product, dto);

    if (dto.discountPercentage) {
      product.discountedPrice =
        product.price * (1 - dto.discountPercentage / 100);
    }

    if (file) {
      if (product.imageUrl) {
        await this.s3Service.deleteFile(
          process.env.AWS_S3_BUCKET || 'yansubucket',
          this.s3Service.extractKeyFromUrl(product.imageUrl), // helper to get S3 key from URL
        );
      }

      const fileUrl = await this.s3Service.uploadFile(
        process.env.AWS_S3_BUCKET || 'yansubucket',
        file.originalname,
        file.buffer,
        file.mimetype,
      );
      product.imageUrl = fileUrl;
    }

    await this.productRepo.save(product);

    await this.elasticSearchService.update({
      index: 'products',
      id: product.id.toString(),
      body: { doc: { ...product } },
    });

    return { message: 'Product updated successfully', product };
  }

  async deleteProduct(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      return { message: 'Product not found' };
    }

    // delete image from S3 if exists
    if (product.imageUrl) {
      await this.s3Service.deleteFile(
        process.env.AWS_S3_BUCKET || 'yansubucket',
        this.s3Service.extractKeyFromUrl(product.imageUrl),
      );
    }

    await this.productRepo.delete(id);

    await this.elasticSearchService.delete({
      index: 'products',
      id: product.id.toString(),
    });

    return { message: 'Product deleted successfully' };
  }

  async uploadFile(file: Express.Multer.File, id: number) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      return { message: 'Product not found' };
    }

    const fileUrl = await this.s3Service.uploadFile(
      process.env.AWS_S3_BUCKET || 'yansubucket',
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    product.imageUrl = fileUrl;
    await this.productRepo.save(product);

    await this.elasticSearchService.update({
      index: 'products',
      id: product.id.toString(),
      body: { doc: { imageUrl: fileUrl } },
    });

    return { message: 'File uploaded successfully', product };
  }
}
