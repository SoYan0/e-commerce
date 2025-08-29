import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AdminProductsController } from './admin/admin-products.controller';
import { PublicProductsController } from './public/public-products.controller';
import { AdminProductsService } from './admin/admin-products.service';
import { PublicProductsService } from './public/public-products.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          apiKey: process.env.ELASTICSEARCH_API_KEY || '',
        },
      }),
      inject: [],
    }),
    S3Module,
  ],
  controllers: [AdminProductsController, PublicProductsController],
  providers: [AdminProductsService, PublicProductsService],
})
export class ProductsModule {}
