# Order Service

## Overview
The Order Service handles all order-related operations in the e-commerce platform, including order creation, processing, tracking, and management. It communicates with the Product Service to validate product availability and pricing.

## Features
- **Order Management**: Create, read, update, and delete orders
- **Order Processing**: Handle order workflow from cart to fulfillment
- **Inventory Validation**: Check product availability before order confirmation
- **Order Tracking**: Track order status and delivery information
- **Payment Integration**: Handle payment processing and confirmation
- **Order History**: Maintain comprehensive order records for users

## Dependencies
- **NestJS Framework**: Modern Node.js framework for building scalable applications
- **TypeORM**: Object-Relational Mapping for PostgreSQL database
- **PostgreSQL**: Primary database for order data
- **Axios**: HTTP client for inter-service communication with Product Service
- **Class Validator**: Request validation and transformation

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL database (v12 or higher)
- Access to Product Service for inventory validation
- Network connectivity to other microservices

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update database connection details
   - Configure Product Service URL for inventory validation

3. **Database Setup:**
   - Create PostgreSQL database for orders
   - Run database migrations (if applicable)
   - Ensure database user has proper permissions
   - Set up appropriate indexes for order queries

4. **Service Communication:**
   - Verify Product Service is accessible
   - Test inter-service communication
   - Configure timeout and retry policies

5. **Build the application:**
   ```bash
   npm run build
   ```

6. **Start the service:**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Service port | 3003 | Yes |
| `NODE_ENV` | Environment mode | development | Yes |
| `DB_URL` | PostgreSQL connection string | - | Yes |
| `PRODUCT_SERVICE_URL` | Product service endpoint | http://localhost:3002 | Yes |

## Database Schema
The service uses PostgreSQL with the following main entities:
- **Orders**: Order header information, customer details, and status
- **OrderItems**: Individual items within an order
- **OrderStatus**: Order workflow states (pending, confirmed, shipped, delivered)
- **Shipping**: Delivery information and tracking details
- **Payments**: Payment records and transaction history

## Order Workflow
1. **Order Creation**: Customer places order with items and shipping details
2. **Validation**: Check product availability and pricing with Product Service
3. **Confirmation**: Confirm order if all validations pass
4. **Processing**: Update inventory and prepare for fulfillment
5. **Shipping**: Generate shipping labels and track delivery
6. **Completion**: Mark order as delivered and update status

## Inter-Service Communication
- **Product Service**: Validates product availability and pricing
- **Auth Service**: Verifies user authentication and authorization
- **API Gateway**: Receives client requests and routes responses

## API Endpoints

### Orders
- `GET /orders` - List orders with pagination and filtering
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order status
- `DELETE /orders/:id` - Cancel order (if applicable)

### Order Management
- `GET /orders/user/:userId` - Get user's order history
- `PUT /orders/:id/status` - Update order status
- `POST /orders/:id/ship` - Mark order as shipped
- `POST /orders/:id/deliver` - Mark order as delivered

### Order Items
- `GET /orders/:id/items` - Get order items
- `POST /orders/:id/items` - Add items to existing order

## Business Logic
- **Inventory Check**: Validates product availability before order confirmation
- **Price Validation**: Ensures pricing consistency with Product Service
- **Order Status Management**: Maintains order state machine
- **User Authorization**: Verifies user permissions for order operations

## Performance Considerations
- Database indexing on frequently queried fields (user_id, status, created_at)
- Connection pooling for database connections
- Caching for frequently accessed order data
- Asynchronous processing for non-critical operations

## Error Handling
- Product availability errors
- Payment processing failures
- Database connection issues
- Inter-service communication failures
- Invalid order state transitions

## Monitoring & Health Checks
- Database connection health
- Product Service connectivity
- Order processing metrics
- Error rate monitoring
- Service response time tracking

## Security Considerations
- User authentication and authorization
- Order data privacy protection
- Payment information security
- Audit logging for order modifications
