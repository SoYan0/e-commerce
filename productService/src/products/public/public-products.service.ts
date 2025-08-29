import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchFiltersDto } from '../dto/search-filters.dto';

@Injectable()
export class PublicProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly elasticSearchService: ElasticsearchService,
  ) {}

  async getAllProducts(page: number = 1, limit: number = 10) {
    const [products, total] = await this.productRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      products,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchProducts(filters: SearchFiltersDto) {
    const {
      search,
      categories,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const must: any[] = [];
    const filter: any[] = [];

    if (search) {
      must.push({
        multi_match: {
          query: search,
          fields: ['name', 'description'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (categories?.length) {
      must.push({
        terms: {
          categories: filters.categories,
        },
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: any = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;

      filter.push({
        range: { price: range },
      });
    }

    const from = (page - 1) * limit;

    const sort = [
      {
        [sortBy]: { order: sortOrder },
      },
    ];

    const result = await this.elasticSearchService.search({
      index: 'products',
      body: {
        query: {
          bool: {
            must,
            filter,
          },
        },
        sort,
        from,
        size: limit,
      },
    });

    return {
      total: result.body.hits.total.value,
      products: result.body.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      })),
    };
  }

  async getProductById(id: string) {
    // Convert string ID to number for database query
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return { message: 'Invalid product ID format' };
    }

    const product = await this.productRepo.findOne({
      where: { id: numericId },
    });

    if (!product) {
      return { message: 'Product not found' };
    }

    return product;
  }

  async getProductsByIds(ids: string[]) {
    // Convert string IDs to numbers for database query
    const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (numericIds.length === 0) {
      return [];
    }

    const products = await this.productRepo
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids: numericIds })
      .getMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price), // Convert string price to number
      stock: product.stock,
    }));
  }

  async getProductsByCategories(categories: string[]) {
    const products = await this.productRepo
      .createQueryBuilder('product')
      .where('product.categories && :categories', { categories })
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    if (products.length === 0) {
      return { message: 'No products found for the given categories' };
    }

    return products;
  }
}
