# Auth Service

## Overview
The Auth Service handles user authentication, authorization, and profile management for the e-commerce platform. It provides secure user registration, login, JWT token management, and email verification using SendGrid.

## Features
- **User Authentication**: Secure login with password hashing using bcrypt
- **User Registration**: Account creation with email verification
- **JWT Management**: Token generation, validation, and refresh
- **Password Management**: Secure password hashing and reset functionality
- **Email Services**: Email verification and notifications via SendGrid
- **Session Management**: Redis-based session storage and management
- **Profile Management**: User profile CRUD operations

## Dependencies
- **NestJS Framework**: Modern Node.js framework for building scalable applications
- **TypeORM**: Object-Relational Mapping for PostgreSQL database
- **PostgreSQL**: Primary database for user data
- **Redis**: Session storage and caching
- **JWT**: JSON Web Token handling for authentication
- **bcrypt**: Password hashing and verification
- **SendGrid**: Email service for notifications and verification
- **Class Validator**: Request validation and transformation

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL database (v12 or higher)
- Redis server (v6 or higher)
- SendGrid account with API key
- Network connectivity to other microservices

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update database connection details
   - Configure Redis connection
   - Set SendGrid API key
   - Configure JWT secret (must match API Gateway)

3. **Database Setup:**
   - Create PostgreSQL database for authentication
   - Run database migrations (if applicable)
   - Ensure database user has proper permissions
   - Set up appropriate indexes for user queries

4. **Redis Setup:**
   - Start Redis server
   - Configure Redis connection parameters
   - Set up Redis persistence if needed

5. **SendGrid Setup:**
   - Create SendGrid account
   - Generate API key
   - Configure sender email address
   - Set up email templates for verification

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
| `PORT` | Service port | 3001 | Yes |
| `NODE_ENV` | Environment mode | development | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `DB_URL` | PostgreSQL connection string | - | Yes |
| `REDIS_URL` | Redis connection string | - | Yes |
| `SENDGRID_API_KEY` | SendGrid API key | - | Yes |
| `SENDGRID_FROM_EMAIL` | Sender email address | - | Yes |

## Database Schema
The service uses PostgreSQL with the following main entities:
- **Users**: User account information and credentials
- **UserProfiles**: Extended user profile data
- **UserSessions**: Active user sessions and tokens
- **EmailVerifications**: Email verification tokens and status
- **PasswordResets**: Password reset tokens and expiration

## Authentication Flow
1. **Registration**: User creates account with email and password
2. **Email Verification**: Send verification email via SendGrid
3. **Login**: Authenticate user with credentials
4. **JWT Generation**: Create access and refresh tokens
5. **Session Management**: Store session data in Redis
6. **Token Validation**: Verify JWT tokens on protected routes

## Security Features
- **Password Hashing**: bcrypt with salt rounds for secure storage
- **JWT Security**: Signed tokens with configurable expiration
- **Session Management**: Redis-based session storage
- **Email Verification**: Required email confirmation for new accounts
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/verify-email` - Verify email address

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Profile Operations
- `GET /users/:id` - Get user by ID (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## JWT Configuration
- **Access Token**: Short-lived (15-60 minutes) for API access
- **Refresh Token**: Long-lived (7-30 days) for token renewal
- **Secret Key**: Must match API Gateway configuration
- **Algorithm**: HS256 for token signing

## Redis Usage
- **Session Storage**: User session data and tokens
- **Rate Limiting**: API request throttling
- **Caching**: Frequently accessed user data
- **Token Blacklisting**: Invalidated refresh tokens

## Email Services
- **Verification Emails**: Account activation links
- **Password Reset**: Secure password reset tokens
- **Welcome Messages**: New user onboarding
- **Security Notifications**: Login alerts and account changes

## Performance Considerations
- Database indexing on frequently queried fields (email, username)
- Redis caching for session data and user profiles
- Connection pooling for database connections
- Asynchronous email processing

## Monitoring & Health Checks
- Database connection health
- Redis connectivity status
- SendGrid API health
- Authentication success/failure rates
- Service response time tracking

## Security Best Practices
- Use strong JWT secrets (32+ characters)
- Implement rate limiting on authentication endpoints
- Log security events and failed attempts
- Regular security audits and updates
- HTTPS enforcement in production
- Input sanitization and validation
