# Product Service

## Overview
The Product Service manages the product catalog, inventory, and search functionality for the e-commerce platform. It provides APIs for product CRUD operations, search capabilities using Elasticsearch, and image storage using AWS S3.

## Features
- **Product Management**: Create, read, update, and delete products
- **Inventory Tracking**: Real-time stock level management
- **Search & Filtering**: Advanced product search using Elasticsearch
- **Image Management**: Product image upload and storage via AWS S3
- **Category Management**: Product categorization and organization
- **Price Management**: Product pricing and discount handling

## Dependencies
- **NestJS Framework**: Modern Node.js framework for building scalable applications
- **TypeORM**: Object-Relational Mapping for PostgreSQL database
- **PostgreSQL**: Primary database for product data
- **Elasticsearch**: Search engine for product search and filtering
- **AWS S3**: Cloud storage for product images
- **Class Validator**: Request validation and transformation

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL database (v12 or higher)
- Elasticsearch cluster (v7.x)
- AWS S3 bucket with appropriate permissions
- AWS credentials configured

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update database connection details
   - Configure Elasticsearch connection
   - Set AWS S3 credentials and bucket name

3. **Database Setup:**
   - Create PostgreSQL database
   - Run database migrations (if applicable)
   - Ensure database user has proper permissions

4. **Elasticsearch Setup:**
   - Start Elasticsearch cluster
   - Create product index with appropriate mappings
   - Configure search analyzers

5. **AWS S3 Setup:**
   - Create S3 bucket for product images
   - Configure CORS policy for image uploads
   - Set up IAM user with S3 permissions

6. **Build the application:**
   ```bash
   npm run build
   ```

7. **Start the service:**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Service port | 3002 | Yes |
| `NODE_ENV` | Environment mode | development | Yes |
| `DB_URL` | PostgreSQL connection string | - | Yes |
| `ELASTICSEARCH_NODE` | Elasticsearch node URL | - | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | - | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - | Yes |
| `AWS_REGION` | AWS region | - | Yes |
| `AWS_S3_BUCKET` | S3 bucket name | - | Yes |

## Database Schema
The service uses PostgreSQL with the following main entities:
- **Products**: Product information, pricing, and metadata
- **Categories**: Product categorization
- **Inventory**: Stock levels and availability
- **Images**: Product image references and metadata

## Search Capabilities
Elasticsearch provides:
- Full-text search across product names and descriptions
- Faceted filtering by category, price, brand, etc.
- Fuzzy matching and typo tolerance
- Relevance scoring and ranking

## Image Management
- Supports multiple image formats (JPEG, PNG, WebP)
- Automatic image optimization and resizing
- CDN-ready image URLs
- Secure upload with file validation

## Development

- **Code formatting**: `npm run format`
- **Linting**: `npm run lint`
- **Testing**: `npm run test`
- **Build**: `npm run build`

## API Endpoints

### Products
- `GET /products` - List products with pagination and filtering
- `GET /products/:id` - Get product details
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Search
- `GET /search` - Search products with advanced filters
- `GET /categories` - List product categories

### Images
- `POST /products/:id/images` - Upload product images
- `DELETE /products/:id/images/:imageId` - Delete product image

## Performance Considerations
- Database indexing on frequently queried fields
- Elasticsearch caching for search results
- S3 CloudFront distribution for image delivery
- Connection pooling for database connections

## Monitoring & Health Checks
- Database connection health
- Elasticsearch cluster status
- S3 connectivity verification
- Service uptime monitoring
