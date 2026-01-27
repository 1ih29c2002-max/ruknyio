# Comprehensive Backend Analysis - Rukny.io API

## Executive Summary

**Rukny.io** is a comprehensive multi-platform backend API built with **NestJS** that provides:
- **Social Profile Management** with customizable link-in-bio pages
- **E-commerce Store System** with full product management and checkout
- **Event Management** with registration, ticketing, and organizer features
- **Form Builder** with advanced analytics and integrations
- **Real-time Notifications** via WebSockets
- **Multiple Third-party Integrations** (Google, Telegram, WhatsApp)

**Tech Stack:** NestJS 11, PostgreSQL (Prisma), Redis, AWS S3, Socket.io, JWT Authentication

---

## 1. Architecture Overview

### 1.1 Application Structure

```
apps/api/
├── src/
│   ├── core/              # Core infrastructure (database, cache, health, config)
│   ├── domain/            # Business logic organized by domain
│   ├── infrastructure/   # Security, persistence, upload services
│   ├── integrations/     # Third-party integrations
│   ├── modules/          # Shared modules (upload)
│   ├── services/         # Global services (S3)
│   ├── shared/           # Shared utilities, constants, types
│   └── main.ts           # Application bootstrap
```

### 1.2 Design Patterns

- **Domain-Driven Design (DDD)**: Features organized by business domains
- **CQRS Pattern**: Separate command/query services (Events, Forms)
- **Facade Pattern**: Simplified interfaces for complex subsystems
- **Repository Pattern**: Prisma as data access layer
- **Module Pattern**: NestJS dependency injection

### 1.3 Entry Points

- **`main.ts`**: Standard API server with full features
- **`main-secure.ts`**: Enhanced security validation at startup

---

## 2. Technology Stack

### 2.1 Core Framework
- **NestJS 11.0.1**: Enterprise Node.js framework
- **TypeScript 5.7.3**: Type-safe development
- **Express**: HTTP server (via @nestjs/platform-express)

### 2.2 Database & ORM
- **PostgreSQL**: Primary database
- **Prisma 6.19.0**: Type-safe ORM with migrations
- **Database Models**: 60+ models covering all features

### 2.3 Caching & Performance
- **Redis (ioredis 5.9.0)**: Caching, rate limiting, session storage
- **@nestjs/cache-manager**: Cache abstraction
- **Compression**: Gzip/deflate response compression

### 2.4 Authentication & Security
- **JWT (@nestjs/jwt)**: Access & refresh tokens
- **Passport.js**: OAuth strategies (Google, LinkedIn)
- **bcryptjs**: Password hashing
- **speakeasy**: 2FA/TOTP generation
- **helmet**: HTTP security headers
- **cookie-parser**: Secure cookie handling

### 2.5 Real-time Communication
- **Socket.io 4.8.1**: WebSocket server
- **@nestjs/websockets**: WebSocket integration
- **@socket.io/redis-adapter**: Multi-server support

### 2.6 File Storage
- **AWS S3 SDK**: Cloud storage
- **multer**: File upload handling
- **sharp**: Image processing
- **file-type**: File validation

### 2.7 Integrations
- **googleapis**: Google Calendar, Drive, Sheets
- **nodemailer**: Email sending
- **axios**: HTTP client
- **qrcode**: QR code generation
- **pdfkit**: PDF generation

### 2.8 Validation & Documentation
- **class-validator**: DTO validation
- **class-transformer**: Data transformation
- **@nestjs/swagger**: API documentation
- **zod**: Environment validation

### 2.9 Utilities
- **date-fns**: Date manipulation
- **nanoid**: Unique ID generation
- **uuid**: UUID generation
- **cheerio**: HTML parsing (URL metadata)

---

## 3. Core Features by Domain

### 3.1 Authentication & Authorization (`domain/auth`)

#### Features:
- **Email/Password Authentication**: Secure login with bcrypt
- **OAuth Integration**: Google & LinkedIn sign-in
- **Quick Sign (Magic Links)**: Passwordless authentication via email
- **Two-Factor Authentication (2FA)**: TOTP-based with backup codes
- **Session Management**: Multi-device session tracking
- **Account Lockout**: Brute-force protection
- **IP Verification**: Security for sensitive operations
- **JWT Token System**: Access tokens (15min) + refresh tokens
- **Token Rotation**: Refresh token rotation for security

#### Security Features:
- Password strength validation
- Account lockout after failed attempts
- Suspicious activity detection
- Device tracking and trusted devices
- Security logs for audit trail
- IP-based rate limiting

#### Controllers:
- `AuthController`: Login, register, logout, refresh
- `QuickSignController`: Magic link authentication
- `TwoFactorController`: 2FA setup and verification
- `AccountLockoutController`: Lockout management

---

### 3.2 User Management (`domain/users`)

#### Features:
- User profiles with roles (ADMIN, PREMIUM, BASIC, GUEST)
- Email verification
- Phone verification (WhatsApp)
- Profile completion tracking
- User dashboard with statistics
- Account upgrade system

---

### 3.3 Profiles (`domain/profiles`)

#### Features:
- **Customizable Profiles**: Username, bio, avatar, cover image
- **Visibility Settings**: Public/Private profiles
- **Storage Tracking**: 5GB default limit per profile
- **Social Links Management**: Multiple links with analytics
- **Link Groups**: Organize links into categories
- **Link Analytics**: Click tracking, geographic data, device info

#### Models:
- `Profile`: Main profile data
- `SocialLink`: Individual social media links
- `LinkGroup`: Link organization
- `link_analytics`: Click tracking

---

### 3.4 Events Management (`domain/events`)

#### Features:
- **Event Creation**: Full event details (title, description, dates, location)
- **Event Categories**: Predefined categories with icons/colors
- **Event Types**: Conference, Workshop, Webinar, Meetup, etc.
- **Registration System**: Attendee registration with status tracking
- **Waitlist Management**: Automatic waitlist when events are full
- **QR Code Tickets**: Unique tickets with QR codes for check-in
- **Event Reviews**: Rating and feedback system
- **Organizer Management**: Multi-organizer support with roles
- **Sponsor Management**: Event sponsors with tiers
- **Google Calendar Integration**: Sync events to Google Calendar
- **Virtual Events**: Support for online events with meeting links
- **Real-time Updates**: WebSocket gateway for live updates

#### Event Statuses:
- SCHEDULED, ONGOING, COMPLETED, CANCELLED

#### Registration Statuses:
- PENDING, CONFIRMED, CANCELLED, ATTENDED, NO_SHOW

#### Controllers:
- `EventsController`: CRUD operations
- `RegistrationsController`: Registration management
- `CategoriesController`: Category management

#### Services (CQRS Pattern):
- `EventsCommandsService`: Write operations
- `EventsQueriesService`: Read operations
- `EventsRegistrationService`: Registration logic
- `EventsFacadeService`: Unified interface

---

### 3.5 Forms Builder (`domain/forms`)

#### Features:
- **Dynamic Form Builder**: Create custom forms with multiple field types
- **Field Types**: Text, Textarea, Number, Email, Phone, Date, Select, Radio, Checkbox, File, Rating, Scale, Toggle, Matrix, Signature
- **Multi-step Forms**: Step-by-step form completion
- **Conditional Logic**: Show/hide fields based on answers
- **Form Analytics**: Views, submissions, completion rates, time tracking
- **Submission Management**: View, export, and analyze responses
- **Form Themes**: Customizable appearance
- **Banner Images**: Multiple banner support
- **Webhooks**: Real-time submission notifications
- **Google Sheets Integration**: Auto-sync submissions
- **Google Drive Integration**: File uploads to Drive
- **Form Types**: Contact, Survey, Registration, Order, Feedback, Quiz, Application

#### Form Statuses:
- DRAFT, PUBLISHED, ARCHIVED, CLOSED

#### Analytics Features:
- Daily view/submission tracking
- Device/browser analytics
- Geographic analytics
- Field-level analytics
- Completion time tracking

#### Services (CQRS Pattern):
- `FormsCommandsService`: Create/update forms
- `FormsQueriesService`: Read operations
- `FormsSubmissionService`: Handle submissions
- `FormsExportService`: Export data
- `FormsStepsService`: Multi-step logic

---

### 3.6 E-commerce Stores (`domain/stores`)

#### Features:
- **Store Management**: Create and manage online stores
- **Product Management**: Full product catalog with variants
- **Product Variants**: Size, color, and custom attributes
- **Product Categories**: Organize products by category
- **Product Attributes**: Dynamic attributes (delivery method, warranty, etc.)
- **Shopping Cart**: Persistent cart per user
- **Order Management**: Complete order lifecycle
- **Guest Checkout**: WhatsApp OTP verification for guests
- **Order Tracking**: Real-time order status updates
- **Coupon System**: Discount codes with usage limits
- **Product Reviews**: Customer reviews and ratings
- **Wishlist**: Save products for later
- **Address Management**: Multiple shipping addresses
- **Store Categories**: Predefined store types with templates

#### Order Statuses:
- PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED

#### Product Statuses:
- ACTIVE, INACTIVE, OUT_OF_STOCK

#### Discount Types:
- PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING

#### Controllers:
- `StoresController`: Store CRUD
- `ProductsController`: Product management
- `CartController`: Shopping cart
- `OrdersController`: Order management
- `CheckoutAuthController`: Guest checkout authentication
- `CheckoutOrdersController`: Guest checkout orders
- `CheckoutAddressesController`: Guest address management
- `OrderTrackingController`: Order tracking
- `ReviewsController`: Product reviews
- `WishlistsController`: Wishlist management
- `CouponsController`: Coupon management
- `AddressesController`: Address management
- `ProductVariantsController`: Variant management
- `ProductAttributesController`: Attribute management
- `ProductCategoriesController`: Category management

---

### 3.7 Social Features (`domain/social`)

#### Features:
- **Follow System**: Follow/unfollow users
- **Posts**: Create and share posts with images
- **Comments**: Comment on posts
- **Likes**: Like posts
- **Share System**: Share profiles/events with QR codes
- **Custom QR Codes**: Branded QR codes with logos

#### Models:
- `follows`: Follow relationships
- `posts`: User posts
- `comments`: Post comments
- `likes`: Post likes

---

### 3.8 Links Management (`domain/links`)

#### Features:
- **Social Links**: Add/edit/delete social media links
- **Link Groups**: Organize links into groups
- **URL Shortener**: Create short URLs with analytics
- **Link Analytics**: Track clicks, geography, devices

---

### 3.9 Notifications (`domain/notifications`)

#### Features:
- **In-app Notifications**: Real-time notifications
- **Notification Types**: 30+ notification types covering:
  - Order status changes
  - Event registrations
  - Security alerts
  - Form submissions
  - Social interactions
- **WebSocket Integration**: Real-time delivery
- **Read/Unread Status**: Notification tracking

---

### 3.10 Storage (`domain/storage`)

#### Features:
- **S3 Integration**: Cloud file storage
- **File Tracking**: Track all user files
- **Storage Limits**: Per-user storage quotas
- **File Categories**: Avatar, Cover, Form, Event, Product images
- **File Management**: Upload, delete, list files

---

### 3.11 Utilities (`domain/utils`)

#### Features:
- **URL Metadata**: Extract metadata from URLs (Open Graph, etc.)
- **Global Search**: Search across all resources

---

## 4. Security Infrastructure

### 4.1 Security Module (`infrastructure/security`)

#### Features:
- **Security Logging**: Comprehensive audit trail
- **Suspicious Activity Detection**: Automated threat detection
- **IP Blocklist**: Block malicious IPs
- **Device Tracking**: Track and manage trusted devices
- **Security Preferences**: User-configurable security settings
- **Cleanup Service**: Automated cleanup of old logs

#### Security Actions Tracked:
- Login success/failure
- Password changes
- 2FA enable/disable
- Session management
- Profile updates
- Suspicious activity

---

### 4.2 Authentication Security

#### JWT Strategy:
- **Access Tokens**: 15-minute expiry
- **Refresh Tokens**: Longer expiry with rotation
- **Session-based**: Session ID in JWT for revocation
- **Token Theft Detection**: Previous token hash tracking

#### Rate Limiting:
- **ThrottlerUserGuard**: User-based rate limiting
- **Production**: 30 requests per 60 seconds
- **Development**: 100 requests per 60 seconds
- **IP-based**: For anonymous users

#### Password Security:
- **bcrypt Hashing**: Secure password storage
- **Minimum Length**: Enforced validation
- **Account Lockout**: After failed attempts

#### 2FA Security:
- **TOTP**: Time-based one-time passwords
- **Backup Codes**: Recovery codes (hashed)
- **Encryption Key**: Separate encryption for 2FA secrets

---

### 4.3 Input Validation & Sanitization

- **SanitizePipe**: XSS protection on all inputs
- **ValidationPipe**: DTO validation with whitelist
- **class-validator**: Field-level validation
- **Zod**: Environment variable validation

---

### 4.4 HTTP Security

- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **CORS**: Configurable origin restrictions
- **Cookie Security**: SameSite=Lax, Secure in production
- **CSRF Protection**: Cookie-based (SameSite)

---

## 5. Infrastructure & Performance

### 5.1 Database (Prisma)

#### Models: 60+ models including:
- User management (User, Profile, Session)
- Events (Event, EventRegistration, EventTicket, EventOrganizer)
- Forms (Form, FormField, FormSubmission)
- Stores (Store, Product, Order, Cart)
- Social (Post, Comment, Like, Follow)
- Security (SecurityLog, TrustedDevice, AccountLockout)
- Integrations (WhatsappOtp, TelegramSession)

#### Performance Optimizations:
- **Indexes**: Strategic indexes on frequently queried fields
- **Composite Indexes**: Multi-column indexes for complex queries
- **Query Optimization**: Efficient Prisma queries
- **Connection Pooling**: Prisma connection management

---

### 5.2 Caching (Redis)

#### Use Cases:
- **Session Storage**: OAuth code storage
- **Rate Limiting**: Request throttling
- **Performance Metrics**: Slow endpoint tracking
- **Cache**: General caching layer

#### Redis Module:
- `RedisService`: Wrapper for ioredis
- `RedisModule`: Global Redis module
- Connection pooling and error handling

---

### 5.3 Performance Monitoring

#### Performance Interceptor:
- **Slow Request Detection**: Logs requests > 1 second
- **Metrics Tracking**: Redis-based metrics
- **Endpoint Normalization**: Groups similar endpoints
- **Performance Logging**: Detailed timing information

#### Metrics Tracked:
- Request count per endpoint
- Success/error rates
- Total response time
- Slow endpoint identification

---

### 5.4 Error Handling

#### Global Exception Filter:
- **Production Safety**: Hides sensitive error details
- **Structured Logging**: Comprehensive error logs
- **User-Friendly Messages**: Safe error messages
- **Auth Endpoint Handling**: Skips logging expected auth failures

---

### 5.5 Health Checks

- **Health Module**: System status monitoring
- **Database Health**: Connection status
- **Redis Health**: Cache availability
- **API Status**: Overall system health

---

## 6. Integrations

### 6.1 Google Services

#### Google Calendar (`integrations/google-calendar`):
- **Event Sync**: Sync events to Google Calendar
- **OAuth Flow**: Google OAuth integration
- **Token Management**: Refresh token handling
- **Calendar Creation**: Automatic calendar creation

#### Google Drive (`integrations/google-drive`):
- **File Upload**: Upload form files to Drive
- **Folder Management**: Organize files in folders
- **OAuth Integration**: Google Drive API access

#### Google Sheets (`integrations/google-sheets`):
- **Form Integration**: Auto-sync form submissions
- **Spreadsheet Creation**: Automatic sheet creation
- **Column Mapping**: Custom field mapping

---

### 6.2 WhatsApp (`integrations/whatsapp`)

#### Features:
- **OTP Verification**: Send OTP codes via WhatsApp
- **Order Notifications**: Order status updates
- **Template Messages**: Predefined message templates
- **Notification Tracking**: Delivery status tracking

#### Use Cases:
- Guest checkout verification
- Order confirmations
- Order status updates

---

### 6.3 Telegram (`integrations/telegram`)

#### Features:
- **Bot Integration**: Telegram bot for notifications
- **Webhook Support**: Receive Telegram updates
- **Session Management**: Secure session handling
- **Message Templates**: Predefined message formats
- **User Linking**: Link Telegram accounts to users

---

### 6.4 Email (`integrations/email`)

#### Features:
- **SMTP Integration**: Nodemailer-based email sending
- **HTML Templates**: Handlebars templates
- **Email Types**:
  - Quick sign (login/signup)
  - Verification codes
  - Password reset
  - Notifications

---

## 7. API Structure

### 7.1 API Versioning

- **URI Versioning**: `/api/v1/`, `/api/v2/`
- **Default Version**: v1
- **Swagger Documentation**: `/api/docs`

### 7.2 Endpoint Organization

**49 Controllers** organized by domain:
- Auth: 4 controllers
- Events: 3 controllers
- Stores: 15 controllers
- Forms: 2 controllers
- Social: 3 controllers
- Links: 3 controllers
- Users: 2 controllers
- Profiles: 1 controller
- Notifications: 1 controller
- Storage: 2 controllers
- Utils: 1 controller
- Integrations: 5 controllers
- Core: 2 controllers (Health, App)

### 7.3 Request/Response Format

- **JSON**: All requests/responses in JSON
- **Validation**: DTO-based validation
- **Error Format**: Standardized error responses
- **Pagination**: Cursor-based pagination for large datasets

---

## 8. Database Schema Highlights

### 8.1 User & Authentication
- `User`: Core user data with roles, 2FA, OAuth links
- `Profile`: User profiles with storage tracking
- `Session`: Multi-device session management
- `SecurityLog`: Comprehensive audit trail
- `TrustedDevice`: Device management
- `AccountLockout`: Brute-force protection
- `TwoFactorBackupCode`: 2FA recovery codes

### 8.2 Events
- `Event`: Event details with categories and types
- `EventRegistration`: Attendee registrations
- `EventTicket`: QR code tickets
- `EventWaitlist`: Waitlist management
- `EventOrganizer`: Multi-organizer support
- `EventSponsor`: Sponsor management
- `EventReview`: Event feedback

### 8.3 Forms
- `Form`: Form definitions with settings
- `FormField`: Dynamic form fields
- `FormSubmission`: User submissions
- `FormIntegration`: Third-party integrations
- `form_analytics`: Analytics data
- `form_steps`: Multi-step form support

### 8.4 E-commerce
- `Store`: Store information
- `products`: Product catalog
- `product_variants`: Product variants
- `product_attributes`: Dynamic attributes
- `product_categories`: Product organization
- `orders`: Order management
- `order_items`: Order line items
- `carts`: Shopping carts
- `cart_items`: Cart contents
- `coupons`: Discount codes
- `addresses`: Shipping addresses
- `reviews`: Product reviews
- `wishlists`: User wishlists

### 8.5 Social & Links
- `posts`: User posts
- `comments`: Post comments
- `likes`: Post likes
- `follows`: Follow relationships
- `SocialLink`: Social media links
- `LinkGroup`: Link organization
- `short_urls`: URL shortener
- `link_analytics`: Link click tracking

### 8.6 Notifications
- `notifications`: In-app notifications
- `WhatsappNotification`: WhatsApp messages
- `WhatsappOtp`: OTP codes

### 8.7 Storage
- `UserFile`: S3 file tracking
- File categories: Avatar, Cover, Form, Event, Product

---

## 9. Best Practices & Patterns

### 9.1 Code Organization
- **Domain-Driven Design**: Features grouped by business domain
- **Separation of Concerns**: Controllers, Services, DTOs separated
- **Module Pattern**: NestJS dependency injection
- **CQRS**: Command/Query separation for complex features

### 9.2 Security Best Practices
- **Input Sanitization**: XSS protection
- **Output Encoding**: Safe error messages
- **Token Rotation**: Refresh token security
- **Rate Limiting**: DDoS protection
- **Audit Logging**: Comprehensive security logs
- **Environment Validation**: Startup validation

### 9.3 Performance Best Practices
- **Database Indexing**: Strategic indexes
- **Caching**: Redis for frequently accessed data
- **Response Compression**: Gzip/deflate
- **Query Optimization**: Efficient Prisma queries
- **Performance Monitoring**: Slow request tracking

### 9.4 Error Handling
- **Global Exception Filter**: Centralized error handling
- **Structured Logging**: Comprehensive error logs
- **User-Friendly Messages**: Safe error responses
- **Error Classification**: Different handling per error type

### 9.5 Testing
- **Jest**: Testing framework configured
- **E2E Tests**: End-to-end test setup
- **Test Coverage**: Coverage reporting configured

---

## 10. Configuration & Environment

### 10.1 Required Environment Variables

#### Database:
- `DATABASE_URL`: PostgreSQL connection string

#### Authentication:
- `JWT_SECRET`: Minimum 32 characters
- `TWO_FACTOR_ENCRYPTION_KEY`: Minimum 32 characters

#### OAuth:
- `GOOGLE_CLIENT_ID`: Optional
- `GOOGLE_CLIENT_SECRET`: Optional
- `LINKEDIN_CLIENT_ID`: Optional
- `LINKEDIN_CLIENT_SECRET`: Optional

#### Redis:
- `REDIS_HOST`: Default 'localhost'
- `REDIS_PORT`: Default '6379'
- `REDIS_PASSWORD`: Optional
- `REDIS_DB`: Default '0'

#### Application:
- `NODE_ENV`: development | production | test
- `PORT`: Default 3001
- `FRONTEND_URL`: Frontend application URL
- `COOKIE_SECURE`: true/false
- `COOKIE_DOMAIN`: Optional

#### Security:
- `INTERNAL_API_SECRET`: Optional, minimum 32 characters
- `LOCKOUT_MAX_ATTEMPTS`: Default 5
- `LOCKOUT_DURATION_MINUTES`: Default 15

#### Email (Optional):
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

### 10.2 Environment Validation

- **Zod Schema**: Validates all environment variables at startup
- **Startup Validation**: Fails fast if configuration is invalid
- **Type Safety**: Typed environment configuration

---

## 11. Deployment & Scripts

### 11.1 Available Scripts

```json
{
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "db:seed": "ts-node prisma/seed.ts",
  "cleanup:sessions": "ts-node src/scripts/cleanup-sessions.ts"
}
```

### 11.2 Database Migrations

- **Prisma Migrations**: Version-controlled schema changes
- **Migration Files**: Located in `prisma/migrations/`
- **Seed Script**: Database seeding support

---

## 12. Known Limitations & Future Work

### 12.1 Disabled Features
- **Todo System**: Commented out in schema, planned for future release

### 12.2 Development Features
- **Dev Module**: Only enabled in non-production environments
- **Swagger**: Disabled by default in production (can be enabled)

---

## 13. Statistics

### 13.1 Codebase Size
- **Controllers**: 49 controllers
- **Database Models**: 60+ models
- **API Endpoints**: 398+ endpoints (estimated)
- **Domain Modules**: 10+ major domains
- **Integrations**: 5 third-party integrations

### 13.2 Feature Count
- **Authentication Methods**: 5 (Email, Google, LinkedIn, Quick Sign, 2FA)
- **Event Features**: 8 major features
- **Form Field Types**: 15 field types
- **Notification Types**: 30+ notification types
- **Order Statuses**: 8 statuses
- **Event Types**: 20+ event types

---

## 14. Conclusion

The Rukny.io backend is a **comprehensive, production-ready API** with:

✅ **Robust Security**: Multi-layer security with 2FA, rate limiting, audit logs  
✅ **Scalable Architecture**: Domain-driven design with clear separation  
✅ **Rich Feature Set**: Social profiles, e-commerce, events, forms  
✅ **Performance Optimized**: Caching, indexing, compression  
✅ **Well Documented**: Swagger API documentation  
✅ **Production Ready**: Error handling, logging, monitoring  

The codebase demonstrates **enterprise-level practices** with proper error handling, security measures, and performance optimizations throughout.

---

**Generated**: 2025-01-XX  
**API Version**: 1.0  
**Framework**: NestJS 11.0.1  
**Database**: PostgreSQL (Prisma 6.19.0)
