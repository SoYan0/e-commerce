# E-Commerce Backend (Microservices Architecture)

## Overview
This is a modern e-commerce backend built with a microservices architecture using NestJS, TypeScript, and PostgreSQL. The system is designed to be scalable, maintainable, and follows best practices for distributed systems.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway  │    │  Auth Service   │    │ Product Service │
│   (Port 3000)  │◄──►│   (Port 3001)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Order Service   │    │   PostgreSQL    │    │   Elasticsearch │
│  (Port 3003)    │    │   Databases     │    │   (Search)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │      Redis      │              │
         │              │   (Sessions)    │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS S3        │    │    SendGrid     │    │   External      │
│ (Image Storage) │    │   (Emails)      │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services

### 1. **API Gateway** (Port 3000)
- **Purpose**: Main entry point for all client requests
- **Features**: Request routing, authentication, CORS management, load balancing
- **Dependencies**: JWT validation, inter-service communication
- **Technology**: NestJS, Passport, Axios

### 2. **Auth Service** (Port 3001)
- **Purpose**: User authentication and authorization
- **Features**: User registration, login, JWT management, email verification
- **Dependencies**: PostgreSQL, Redis, SendGrid, bcrypt
- **Technology**: NestJS, TypeORM, JWT, Redis

### 3. **Product Service** (Port 3002)
- **Purpose**: Product catalog and inventory management
- **Features**: Product CRUD, search, image management, inventory tracking
- **Dependencies**: PostgreSQL, Elasticsearch, AWS S3
- **Technology**: NestJS, TypeORM, Elasticsearch, AWS SDK

### 4. **Order Service** (Port 3003)
- **Purpose**: Order processing and management
- **Features**: Order creation, tracking, inventory validation
- **Dependencies**: PostgreSQL, Product Service integration
- **Technology**: NestJS, TypeORM, Axios

## Prerequisites

### System Requirements
- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **PostgreSQL**: v12 or higher
- **Redis**: v6 or higher
- **Elasticsearch**: v7.x

### External Services
- **AWS Account**: For S3 image storage
- **SendGrid Account**: For email services
- **Network Access**: For inter-service communication

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd e-commerce-backend
```

### 2. Install Dependencies
```bash
# Install dependencies for all services
cd APIGateway && npm install
cd ../productService && npm install
cd ../orderService && npm install
cd ../authService && npm install
```

### 3. Environment Setup
```bash
# Copy environment files for each service
cp APIGateway/env.example APIGateway/.env
cp productService/env.example productService/.env
cp orderService/env.example orderService/.env
cp authService/env.example authService/.env
```

### 4. Database Setup
```bash
# Create databases
createdb auth_db
createdb products_db
createdb orders_db

# Start Redis
redis-server

# Start Elasticsearch
elasticsearch
```

### 5. Start Services
```bash
# Terminal 1: Start API Gateway
cd APIGateway && npm run start:dev

# Terminal 2: Start Auth Service
cd authService && npm run start:dev

# Terminal 3: Start Product Service
cd productService && npm run start:dev

# Terminal 4: Start Order Service
cd orderService && npm run start:dev
```

## Configuration

### Environment Variables
Each service has its own `.env` file with specific configuration:
- **API Gateway**: Service URLs, JWT secrets, CORS settings
- **Auth Service**: Database, Redis, JWT, SendGrid configuration
- **Product Service**: Database, Elasticsearch, AWS S3 settings
- **Order Service**: Database, Product Service integration

### Database Configuration
- **Auth Service**: `auth_db` for user accounts and sessions
- **Product Service**: `products_db` for product catalog and inventory
- **Order Service**: `orders_db` for order management

### Service Communication
- **Internal Ports**: 3000-3003 for local development
- **JWT Secret**: Must be identical across API Gateway and Auth Service
- **Service URLs**: Configured for inter-service communication

## Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety and modern JavaScript features
- **Jest**: Unit and integration testing

### Available Scripts
```bash
# Common across all services
npm run build          # Build the application
npm run start:dev      # Start in development mode
npm run start:prod     # Start in production mode
npm run test           # Run tests
npm run lint           # Lint code
npm run format         # Format code
```

### Testing
```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Deployment

### Production Considerations
- **Environment Variables**: Use production values
- **Database**: Production PostgreSQL with proper security
- **Redis**: Production Redis cluster
- **Elasticsearch**: Production cluster with proper indexing
- **AWS S3**: Production bucket with proper permissions
- **HTTPS**: Enable SSL/TLS for all services
- **Load Balancing**: Consider using a load balancer
- **Monitoring**: Implement health checks and logging

### Docker Support
Each service can be containerized:
```bash
# Build Docker images
docker build -t api-gateway ./APIGateway
docker build -t auth-service ./authService
docker build -t product-service ./productService
docker build -t order-service ./orderService
```

## Monitoring & Health Checks

### Service Health
- Database connectivity
- Redis connectivity
- External service availability
- Service response times

### Logging
- Structured logging across all services
- Error tracking and monitoring
- Performance metrics collection

## Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure password hashing with bcrypt
- Session management with Redis

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

### Network Security
- HTTPS enforcement in production
- Service-to-service authentication
- Rate limiting and DDoS protection

## Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Ensure code quality (lint, format)
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Standards
- Follow TypeScript best practices
- Use NestJS patterns and conventions
- Write comprehensive tests
- Document API endpoints
- Follow Git commit message conventions

## Support

### Documentation
- Service-specific README files
- API documentation (if available)
- Architecture diagrams
- Configuration examples

### Issues
- Check existing issues first
- Provide detailed error information
- Include environment details
- Share relevant logs

## License
This project is proprietary and confidential. All rights reserved.
