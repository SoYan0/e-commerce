# API Gateway Service

## Overview
The API Gateway is the main entry point for all client requests in the e-commerce platform. It acts as a reverse proxy, routing requests to appropriate microservices while handling authentication, CORS, and request/response transformation.

## Features
- **Request Routing**: Routes incoming requests to appropriate microservices (Auth, Product, Order)
- **Authentication**: JWT token validation and user authentication
- **CORS Management**: Handles Cross-Origin Resource Sharing
- **Load Balancing**: Distributes requests across service instances
- **Request/Response Transformation**: Standardizes API responses

## Dependencies
- **NestJS Framework**: Modern Node.js framework for building scalable applications
- **JWT Authentication**: JSON Web Token handling for secure authentication
- **Passport**: Authentication middleware
- **Axios**: HTTP client for inter-service communication
- **Class Validator**: Request validation and transformation

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Access to other microservices (Auth, Product, Order)

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update service URLs and JWT secret
   - Ensure JWT_SECRET matches the Auth Service

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Start the service:**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | API Gateway port | 3000 | Yes |
| `NODE_ENV` | Environment mode | development | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `AUTH_SERVICE_URL` | Auth service endpoint | http://localhost:3001 | Yes |
| `PRODUCT_SERVICE_URL` | Product service endpoint | http://localhost:3002 | Yes |
| `ORDER_SERVICE_URL` | Order service endpoint | http://localhost:3003 | Yes |

## Service Endpoints

The API Gateway routes requests to the following services:
- **Auth Service**: User authentication, registration, and profile management
- **Product Service**: Product catalog, search, and inventory management
- **Order Service**: Order processing, tracking, and management

## Development

- **Code formatting**: `npm run format`
- **Linting**: `npm run lint`
- **Testing**: `npm run test`
- **Build**: `npm run build`

## Port Configuration
- **API Gateway**: 3000
- **Auth Service**: 3001
- **Product Service**: 3002
- **Order Service**: 3003

## Security Notes
- JWT secret must be identical across API Gateway and Auth Service
- CORS configuration should be properly set for production environments
- All inter-service communication should use HTTPS in production
