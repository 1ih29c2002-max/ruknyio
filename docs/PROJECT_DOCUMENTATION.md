# Social Profile Platform Project Documentation - Rukny.io

## Project Overview

This project is a comprehensive modern platform built with Next.js and NestJS that enables users to create personal profiles with social media links, operate online stores, and organize events/activities. The platform includes a subscription model to monetize various features and functionality.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Architecture](#project-architecture)
3. [Domain Structure](#domain-structure)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Security Implementation](#security-implementation)
7. [Performance Optimizations](#performance-optimizations)
8. [URL Shortener Feature](#url-shortener-feature)
9. [Analytics and Monitoring](#analytics-and-monitoring)
10. [Documentation Resources](#documentation-resources)
11. [Deployment Guidelines](#deployment-guidelines)
12. [Testing Strategy](#testing-strategy)
13. [Development Workflow](#development-workflow)

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Forms**: React Hook Form
- **State Management**: Zustand
- **Authentication**: NextAuth.js v5

### Backend
- **Framework**: NestJS 10+
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT + Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator & Class Transformer

### Security
- **Authentication**: JWT Tokens with NextAuth.js
- **Authorization**: NestJS Guards & Decorators
- **Data Validation**: Zod (Frontend) + Class Validator (Backend)
- **Password Hashing**: bcryptjs
- **CORS Protection**: NestJS built-in protection

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston Logger + Sentry
- **Performance**: Redis Caching
- **File Storage**: Cloudinary or AWS S3

## Project Architecture

The project follows a modern full-stack architecture with clear separation between frontend and backend, utilizing TypeScript across the entire stack for type safety and better developer experience.

### Architecture Overview:
```
rukny-io/
├── apps/
│   ├── web/              # Next.js Frontend Application
│   └── api/              # NestJS Backend API
├── packages/
│   ├── ui/               # Shared UI Components
│   ├── types/            # Shared TypeScript Types
│   └── database/         # Prisma Database Schema
├── docker-compose.yml
└── package.json
```

### Key Components:

1. **Frontend Layer (Next.js)**:
   - App Router with TypeScript
   - Server and Client Components
   - API Routes for internal logic
   - Authentication with NextAuth.js

2. **Backend Layer (NestJS)**:
   - Modular architecture with decorators
   - Dependency injection container
   - Guards, Pipes, and Interceptors
   - Swagger API documentation

3. **Database Layer**:
   - PostgreSQL with Prisma ORM
   - Type-safe database queries
   - Migration management
   - Connection pooling

4. **Caching Layer**:
   - Redis for session storage
   - API response caching
   - Rate limiting storage

## Domain Structure

### Frontend Structure (Next.js)
```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── store/
│   │   ├── events/
│   │   └── analytics/
│   ├── api/
│   │   └── auth/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/              # Shadcn/ui components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database connection
│   ├── utils.ts         # Utility functions
│   └── validations.ts   # Zod schemas
├── hooks/               # Custom React hooks
├── store/               # Zustand stores
└── types/               # TypeScript types
```

### Backend Structure (NestJS)
```
apps/api/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   └── guards/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   ├── profiles/
│   │   ├── profiles.controller.ts
│   │   ├── profiles.service.ts
│   │   ├── profiles.module.ts
│   │   └── dto/
│   ├── stores/
│   │   ├── stores.controller.ts
│   │   ├── stores.service.ts
│   │   ├── stores.module.ts
│   │   └── dto/
│   ├── events/
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   ├── events.module.ts
│   │   └── dto/
│   ├── payments/
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.module.ts
│   │   └── dto/
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   ├── main.ts
│   └── app.module.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── test/
```

### Domain Responsibilities

#### Profile Domain
- User profile management and social media links
- Profile visibility and privacy settings
- Profile analytics and insights
- Custom profile themes and layouts

#### Store Domain
- Product catalog management
- Order processing and fulfillment
- Inventory tracking and alerts
- Store analytics and performance metrics

#### Event Domain
- Event creation and management
- Registration and attendee management
- Calendar integration and notifications
- Event analytics and feedback collection

#### Payment Domain
- Subscription management and billing
- Payment processing with Stripe
- Invoice generation and management
- Revenue tracking and reporting

## Database Schema

### Core Tables

#### `users`
```
- id (primary key)
- name
- email
- password
- email_verified_at
- remember_token
- created_at
- updated_at
```

#### `profiles`
```
- id (primary key)
- user_id (foreign key)
- username (unique)
- bio
- avatar
- cover_image
- visibility (public, private)
- created_at
- updated_at
```

#### `social_links`
```
- id (primary key)
- profile_id (foreign key)
- platform (e.g., Twitter, Instagram)
- username
- url
- short_url
- display_order
- created_at
- updated_at
```

#### `stores`
```
- id (primary key)
- user_id (foreign key)
- name
- slug (unique)
- description
- logo
- banner
- contact_email
- contact_phone
- status (active, inactive)
- created_at
- updated_at
```

#### `products`
```
- id (primary key)
- store_id (foreign key)
- name
- slug (unique)
- description
- price
- sale_price
- quantity
- status (active, inactive, out_of_stock)
- created_at
- updated_at
```

#### `product_images`
```
- id (primary key)
- product_id (foreign key)
- image_path
- display_order
- is_primary
- created_at
- updated_at
```

#### `orders`
```
- id (primary key)
- store_id (foreign key)
- user_id (foreign key)
- order_number (unique)
- status (pending, paid, shipped, delivered, cancelled)
- total_amount
- payment_method
- shipping_address
- billing_address
- notes
- created_at
- updated_at
```

#### `order_items`
```
- id (primary key)
- order_id (foreign key)
- product_id (foreign key)
- quantity
- price
- created_at
- updated_at
```

#### `events`
```
- id (primary key)
- user_id (foreign key)
- title
- slug (unique)
- description
- start_date
- end_date
- location
- venue
- max_attendees
- price
- is_featured
- status (scheduled, ongoing, completed, cancelled)
- created_at
- updated_at
```

#### `event_registrations`
```
- id (primary key)
- event_id (foreign key)
- user_id (foreign key)
- status (registered, attended, cancelled)
- created_at
- updated_at
```

#### `plans`
```
- id (primary key)
- name
- description
- price
- billing_cycle (monthly, yearly)
- features (JSON)
- is_active
- created_at
- updated_at
```

#### `subscriptions`
```
- id (primary key)
- user_id (foreign key)
- plan_id (foreign key)
- status (active, cancelled, expired)
- start_date
- end_date
- payment_method
- created_at
- updated_at
```

#### `short_urls`
```
- id (primary key)
- user_id (foreign key, nullable)
- original_url
- short_code (unique)
- clicks
- expires_at (nullable)
- created_at
- updated_at
```

## API Documentation

### Authentication Endpoints

#### `POST /api/v1/auth/register`
Create a new user account

**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "createdAt": "2025-10-24T00:00:00.000Z"
  },
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here"
}
```

#### `POST /api/v1/auth/login`
Authenticate a user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com"
  },
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here"
}
```

### Profile Endpoints

#### `GET /api/v1/profiles/{username}`
Get a user's profile

**Response:**
```json
{
  "id": 1,
  "username": "username",
  "bio": "User bio",
  "avatar": "url/to/avatar.jpg",
  "cover_image": "url/to/cover.jpg",
  "social_links": [
    {
      "id": 1,
      "platform": "Twitter",
      "username": "twitterusername",
      "url": "https://twitter.com/username",
      "short_url": "https://yourdomain.com/s/ab12cd"
    }
  ]
}
```

#### `PUT /api/v1/profiles/{username}`
Update a user's profile

**Request:**
```json
{
  "bio": "Updated bio",
  "avatar": "base64_encoded_image",
  "cover_image": "base64_encoded_image"
}
```

### Store Endpoints

#### `GET /api/v1/stores/{slug}`
Get a store

**Response:**
```json
{
  "id": 1,
  "name": "Store Name",
  "description": "Store description",
  "logo": "url/to/logo.jpg",
  "banner": "url/to/banner.jpg",
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "price": "19.99",
      "description": "Product description",
      "images": [
        {
          "id": 1,
          "url": "url/to/product_image.jpg",
          "is_primary": true
        }
      ]
    }
  ]
}
```

### Event Endpoints

#### `GET /api/v1/events`
List events

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Event Title",
      "description": "Event description",
      "start_date": "2025-10-15T18:00:00.000000Z",
      "end_date": "2025-10-15T21:00:00.000000Z",
      "venue": "Event Venue",
      "location": "Event Location",
      "max_attendees": 100,
      "registered_attendees": 45
    }
  ]
}
```

### Subscription Endpoints

#### `GET /api/v1/plans`
List subscription plans

**Response:**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "Basic Plan",
      "description": "Basic features",
      "price": "9.99",
      "billing_cycle": "monthly",
      "features": [
        "Feature 1",
        "Feature 2"
      ]
    },
    {
      "id": 2,
      "name": "Premium Plan",
      "description": "All features",
      "price": "19.99",
      "billing_cycle": "monthly",
      "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3",
        "Feature 4"
      ]
    }
  ]
}
```

#### `POST /api/v1/subscribe/{plan}`
Subscribe to a plan

**Request:**
```json
{
  "payment_method": "stripe",
  "payment_token": "stripe_payment_token"
}
```

### URL Shortener Endpoints

#### `POST /api/v1/url-shortener`
Create a short URL

**Request:**
```json
{
  "url": "https://very-long-url-that-needs-shortening.com/with/many/parameters?and=values"
}
```

**Response:**
```json
{
  "original_url": "https://very-long-url-that-needs-shortening.com/with/many/parameters?and=values",
  "short_url": "https://yourdomain.com/s/ab12cd",
  "expires_at": null
}
```

### Security Implementation

#### Authentication
The project uses JWT tokens with NextAuth.js for the frontend and NestJS Guards for API protection. This provides a secure and scalable authentication system.

#### Authorization
NestJS Guards and Decorators implement role-based access control:

1. **Roles**:
   - Admin: Full access to all features
   - Premium User: Access to premium features
   - Basic User: Limited feature access
   - Guest: Public content only

2. **Guards Implementation**:
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

#### Data Protection
- HTTPS enforced across all routes
- Sensitive data encryption at rest with bcryptjs
- Rate limiting on authentication endpoints using NestJS throttler
- XSS protection via built-in sanitization
- CORS protection configured in NestJS

#### Security Headers
```typescript
// Implementation in NestJS main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Documentation Resources

Comprehensive documentation is crucial for both developers and end-users. The project maintains several types of documentation to ensure clarity and accessibility.

### Interactive API Documentation

#### Swagger/OpenAPI Implementation

The API is documented using OpenAPI 3.0 specifications with NestJS decorators, providing interactive documentation for developers.

```typescript
// NestJS Controller with Swagger decorators
@ApiTags('profiles')
@Controller('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a user profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }
}
```

#### Swagger Configuration

```typescript
// main.ts configuration
const config = new DocumentBuilder()
  .setTitle('Rukny.io API')
  .setDescription('API documentation for the Rukny.io platform')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

#### Controller Annotations Example

```typescript
@ApiOperation({ summary: 'Create or update a user profile' })
@ApiBody({
  description: 'Profile data',
  type: CreateProfileDto,
  examples: {
    example1: {
      summary: 'Basic profile',
      value: {
        username: 'johndoe',
        bio: 'My awesome bio',
        avatar: 'https://example.com/avatar.jpg'
      }
    }
  }
})
@ApiResponse({
  status: 200,
  description: 'Profile created or updated successfully',
  type: ProfileResponseDto,
})
@ApiResponse({
  status: 422,
  description: 'Validation error',
  type: ValidationErrorDto,
})
@Post()
async store(@Body() createProfileDto: CreateProfileDto) {
  return this.profilesService.create(createProfileDto);
}
```

#### Key Features

1. **Interactive API Explorer**
   - "Try it out" functionality for API endpoints
   - Request/response examples
   - Authentication integration
   - Schema visualization

2. **API Documentation Generation**
   - Automatic generation from code annotations
   - CI/CD integration for documentation updates
   - Version history tracking

3. **Documentation Access Control**
   - Public vs. authenticated documentation views
   - Developer-specific API keys for testing
   - Sandbox environment for API exploration

### User Guides and Help Center

#### Knowledge Base Structure

```
resources/
└── views/
    └── help/
        ├── getting-started/
        │   ├── index.blade.php
        │   ├── account-setup.blade.php
        │   └── first-profile.blade.php
        ├── profiles/
        │   ├── index.blade.php
        │   ├── social-links.blade.php
        │   └── analytics.blade.php
        ├── stores/
        │   ├── index.blade.php
        │   ├── products.blade.php
        │   └── orders.blade.php
        └── events/
            ├── index.blade.php
            ├── creating-events.blade.php
            └── attendee-management.blade.php
```

#### Key Components

1. **User Documentation**
   - Step-by-step guides with screenshots
   - Video tutorials for complex features
   - FAQ sections for common issues
   - Feature highlight articles

2. **Searchable Knowledge Base**
   - Full-text search across documentation
   - Category-based browsing
   - Related articles suggestions
   - Popularity and usefulness ratings

3. **Interactive Support**
   - Live chat integration
   - Support ticket submission
   - Community forums
   - Feedback collection mechanisms

4. **Content Management**
   - Admin dashboard for documentation updates
   - Version control for help articles
   - Analytics on most viewed/helpful articles
   - Automatic related content suggestions

### Developer Onboarding Documentation

#### Structure

```
docs/
├── getting-started/
│   ├── README.md
│   ├── development-environment.md
│   └── code-standards.md
├── architecture/
│   ├── README.md
│   ├── domain-design.md
│   └── service-layer.md
├── domains/
│   ├── profile/
│   ├── store/
│   ├── event/
│   └── subscription/
└── development-workflow/
    ├── git-workflow.md
    ├── testing.md
    └── deployment.md
```

#### Key Components

1. **Development Environment Setup**
   - Local environment requirements
   - Development tools installation
   - Docker containerization guide
   - IDE configuration recommendations

2. **Architecture Documentation**
   - System architecture diagrams
   - Component interaction flowcharts
   - Database schema visualization
   - API flow documentation

3. **Coding Standards**
   - PHP/Laravel coding standards
   - React component structure guidelines
   - Testing expectations
   - Documentation requirements

4. **Contribution Guidelines**
   - Pull request process
   - Code review checklist
   - Testing requirements
   - Documentation update guidelines

### Architecture Decision Records (ADRs)

#### Structure

```
docs/
└── architecture/
    └── decisions/
        ├── 0001-record-architecture-decisions.md
        ├── 0002-use-domain-driven-design.md
        ├── 0003-use-laravel-sanctum-for-api-auth.md
        ├── 0004-implement-event-sourcing-for-analytics.md
        └── 0005-redis-for-caching-strategy.md
```

#### ADR Template

```markdown
# [ADR-0001] Record Architecture Decisions

## Status
Accepted

## Context
We need to record the architectural decisions made on this project to provide context for future developers and to document the rationale behind our choices.

## Decision
We will use Architecture Decision Records, as described by Michael Nygard in this article: http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions

## Consequences
See Michael Nygard's article, linked above. For a lightweight ADR toolset, see Nat Pryce's adr-tools at https://github.com/npryce/adr-tools.

We will keep ADRs in the project repository under docs/architecture/decisions to make them accessible to developers working with the codebase.
```

#### Key Components

1. **Decision Catalog**
   - Chronologically ordered decisions
   - Status tracking (proposed, accepted, deprecated)
   - References to related decisions

2. **Decision Context**
   - Problem statement
   - Constraints and considerations
   - Alternatives evaluated
   - Decision criteria

3. **Implementation Details**
   - Technical approach chosen
   - Code or configuration examples
   - Integration points
   - Migration plans

4. **Impact Assessment**
   - Consequences of the decision
   - Trade-offs accepted
   - Risks and mitigations
   - Future considerations

## Performance Optimizations

### Caching Strategy

1. **Redis Cache Implementation**:
```typescript
// NestJS Cache Module configuration
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 300, // 5 minutes default TTL
    }),
  ],
})
export class AppModule {}

// Usage in service
@Injectable()
export class ProfilesService {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async getProfile(username: string) {
    const cacheKey = `profile:${username}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) return cached;
    
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      include: { socialLinks: true }
    });
    
    await this.cacheService.set(cacheKey, profile, 600);
    return profile;
  }
}
```

2. **Next.js Optimizations**:
```typescript
// next.config.js
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
  images: {
    domains: ['cloudinary.com', 'amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
};
```

3. **Database Query Optimization**:
```typescript
// Prisma optimizations
const profiles = await prisma.profile.findMany({
  include: {
    socialLinks: {
      select: {
        platform: true,
        url: true,
        displayOrder: true,
      },
    },
    _count: {
      select: {
        followers: true,
        stores: true,
      },
    },
  },
  take: 20,
  skip: page * 20,
});
```

### CDN and Asset Optimization
- Cloudinary for image optimization and delivery
- Next.js automatic image optimization
- Static asset caching with appropriate headers
- Gzip/Brotli compression enabled

## URL Shortener Feature

The URL shortener provides easy sharing of profile pages, store products, and events.

### Implementation Details

```typescript
// NestJS Service Implementation
@Injectable()
export class UrlShortenerService {
  constructor(private prisma: PrismaService) {}

  async shorten(url: string, userId?: string): Promise<string> {
    const code = await this.generateUniqueCode();
    
    const shortUrl = await this.prisma.shortUrl.create({
      data: {
        originalUrl: url,
        shortCode: code,
        userId,
        clicks: 0,
      },
    });
    
    return `${process.env.APP_URL}/s/${code}`;
  }
  
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists: boolean;
    
    do {
      code = crypto.randomBytes(4).toString('hex');
      exists = await this.prisma.shortUrl.findUnique({
        where: { shortCode: code },
      }) !== null;
    } while (exists);
    
    return code;
  }
  
  async resolveUrl(code: string): Promise<string | null> {
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { shortCode: code },
    });
    
    if (shortUrl) {
      // Increment click count asynchronously
      this.prisma.shortUrl.update({
        where: { id: shortUrl.id },
        data: { clicks: { increment: 1 } },
      }).catch(console.error);
      
      return shortUrl.originalUrl;
    }
    
    return null;
  }
}
```

### Controller Implementation

```typescript
@Controller('s')
@ApiTags('url-shortener')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}
  
  @Get(':code')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({ name: 'code', description: 'Short URL code' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.urlShortenerService.resolveUrl(code);
    
    if (url) {
      return res.redirect(301, url);
    }
    
    throw new NotFoundException('Short URL not found');
  }
  
  @Post('shorten')
  @ApiOperation({ summary: 'Create a short URL' })
  @UseGuards(JwtAuthGuard)
  async createShortUrl(@Body() dto: CreateShortUrlDto, @GetUser() user: User) {
    const shortUrl = await this.urlShortenerService.shorten(dto.url, user.id);
    return { shortUrl, originalUrl: dto.url };
  }
}
```

## Analytics and Monitoring

The platform implements comprehensive analytics and monitoring systems to track user behavior, business performance metrics, system health, and error management.

### User Behavior Analytics

#### Architecture

```
app/
├── Analytics/
│   ├── Providers/
│   │   └── AnalyticsServiceProvider.php
│   ├── Services/
│   │   ├── ProfileAnalyticsService.php
│   │   ├── StoreAnalyticsService.php
│   │   ├── EventAnalyticsService.php
│   │   └── UserEngagementService.php
│   ├── Models/
│   │   ├── AnalyticsEvent.php
│   │   └── UserAction.php
│   └── Jobs/
│       └── ProcessAnalyticsData.php
```

#### Key Features

1. **User Journey Tracking**
   - Page views, time spent, and navigation paths
   - Click heat maps on critical pages
   - Feature usage frequency across user segments
   - Conversion funnels for subscription upgrades

2. **Event Tracking Implementation**

```typescript
// Analytics Service (NestJS)
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(userId: string, eventType: string, eventData: any = {}) {
    const event = await this.prisma.analyticsEvent.create({
      data: {
        userId,
        eventType,
        eventData: JSON.stringify(eventData),
        ipAddress: this.getClientIP(),
        userAgent: this.getUserAgent(),
        timestamp: new Date(),
      },
    });
    
    // Queue for async processing to avoid performance impact
    await this.queueService.add('process-analytics', event);
    
    return event;
  }
}

// Frontend tracking (Next.js)
export const useAnalytics = () => {
  const trackEvent = useCallback((eventType: string, data?: any) => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, data }),
    });
  }, []);

  return { trackEvent };
};
```

3. **Analytics Dashboard**
   - Real-time active users visualization
   - User retention and churn metrics
   - Feature popularity rankings
   - Cohort analysis by signup date, subscription tier, etc.

4. **Data Export**
   - Scheduled reports via email
   - CSV/Excel downloads of analytics data
   - API endpoints for external analytics tools integration

### Business Metrics Tracking

#### Database Schema

```
business_metrics
- id (primary key)
- metric_name (string)
- metric_value (float)
- dimension (string, nullable)
- dimension_value (string, nullable)
- timestamp
- created_at
- updated_at
```

#### Key Metrics Tracked

1. **Revenue Analytics**
   - Monthly Recurring Revenue (MRR)
   - Average Revenue Per User (ARPU)
   - Lifetime Value (LTV)
   - Revenue by subscription tier

2. **Store Performance**
   - Sales volume by store/product
   - Average order value
   - Conversion rates
   - Inventory turnover

3. **Event Metrics**
   - Registration rates
   - Attendance vs. capacity
   - Revenue per event
   - Repeat attendance rates

4. **Engagement KPIs**
   - Daily Active Users (DAU)
   - Monthly Active Users (MAU)
   - Stickiness ratio (DAU/MAU)
   - Feature adoption rates

#### Metrics Collection

```typescript
// Business Metrics Service (NestJS)
@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async recordMetric(
    name: string, 
    value: number, 
    dimension?: string, 
    dimensionValue?: string
  ) {
    return this.prisma.businessMetric.create({
      data: {
        metricName: name,
        metricValue: value,
        dimension,
        dimensionValue,
        timestamp: new Date(),
      },
    });
  }

  async getMetrics(name: string, timeRange: { from: Date; to: Date }) {
    return this.prisma.businessMetric.findMany({
      where: {
        metricName: name,
        timestamp: {
          gte: timeRange.from,
          lte: timeRange.to,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }
}
```

### System Health Monitoring

#### Components Monitored

1. **Infrastructure Monitoring**
   - Server CPU, memory, disk usage
   - Database connection pool status
   - Cache hit/miss rates
   - Queue worker health

2. **Application Performance**
   - Request response times
   - Database query performance
   - External API response times
   - Background job completion rates

3. **Real-time Health Dashboard**

```typescript
// System Health Service (NestJS)
@Injectable()
export class SystemHealthService {
  constructor(
    private prisma: PrismaService,
    private redis: Redis,
  ) {}

  async getHealthMetrics() {
    const [dbHealth, redisHealth, memoryUsage] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.getMemoryUsage(),
    ]);

    return {
      database: dbHealth,
      cache: redisHealth,
      memory: memoryUsage,
      timestamp: new Date(),
    };
  }

  private async checkDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private async checkRedisHealth() {
    try {
      const start = Date.now();
      await this.redis.ping();
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Health endpoint
@Controller('health')
export class HealthController {
  constructor(private healthService: SystemHealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.getHealthMetrics();
  }
}
```

4. **Integration with DevOps Tools**
   - Prometheus metrics endpoint
   - Grafana dashboards
   - New Relic APM integration
   - PagerDuty alerts for critical issues

### Error Logging and Notification Systems

#### Architecture

```
app/
├── Exceptions/
│   ├── Handler.php
│   └── CustomExceptionReporter.php
├── Services/
│   └── ErrorNotificationService.php
└── Models/
    └── SystemError.php
```

#### Key Features

1. **Structured Error Logging**
   - Contextual error data capture
   - Request information preservation
   - User session details when applicable
   - Environment data for reproducibility

2. **Exception Handling**

```typescript
// Global Exception Filter (NestJS)
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error with context
    this.logger.error({
      ...errorResponse,
      error: exception instanceof Error ? exception.message : exception,
      stack: exception instanceof Error ? exception.stack : undefined,
      user: request.user?.id,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
    });

    // Send notification for critical errors
    if (status >= 500) {
      this.notificationService.notifyTeam(exception, 'critical');
    }

    response.status(status).json(errorResponse);
  }
}
```

3. **Error Classification and Routing**
   - Severity-based classification (critical, error, warning)
   - Error type categorization (database, API, frontend)
   - Team assignment based on subsystem
   - Rate limiting for notification storms

4. **Notification Channels**
   - Email alerts for critical errors
   - Slack integration for team notifications
   - SMS alerts for on-call engineers
   - Dashboard for error trends and patterns

```typescript
// Error Notification Service (NestJS)
@Injectable()
export class ErrorNotificationService {
  constructor(
    private emailService: EmailService,
    private slackService: SlackService,
    private smsService: SmsService,
  ) {}

  async notifyTeam(error: any, severity: 'critical' | 'error' | 'warning') {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      severity,
    };

    switch (severity) {
      case 'critical':
        await Promise.all([
          this.smsService.sendAlert(errorData),
          this.slackService.sendAlert(errorData),
          this.emailService.sendAlert(errorData),
        ]);
        break;
        
      case 'error':
        await this.slackService.sendAlert(errorData);
        if (!this.isWorkingHours()) {
          await this.emailService.sendAlert(errorData);
        }
        break;
        
      case 'warning':
        await this.logToErrorDashboard(errorData);
        break;
    }
  }

  private isWorkingHours(): boolean {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17;
  }
}

## Deployment Guidelines

### Server Requirements
- Node.js 18+
- PostgreSQL 14+
- Redis 6.x+
- Nginx or Apache
- SSL certificate
- Docker & Docker Compose (recommended)

### Deployment Steps

1. **Environment Setup**
```bash
# Clone repository
git clone https://repository-url.git rukny-io
cd rukny-io

# Install dependencies for both apps
npm install

# Backend setup
cd apps/api
cp .env.example .env
npm run build

# Frontend setup
cd ../web
cp .env.example .env.local
npm run build

# Database setup
cd ../api
npx prisma migrate deploy
npx prisma db seed
```

2. **Docker Deployment (Recommended)**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: rukny_io
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

  api:
    build: ./apps/api
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/rukny_io
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3000"

  web:
    build: ./apps/web
    environment:
      NEXT_PUBLIC_API_URL: http://api:3000
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  redis_data:
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name rukny.io www.rukny.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rukny.io www.rukny.io;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API (NestJS)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### CI/CD Pipeline with GitHub Actions

```yaml
name: Deploy Rukny.io

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run API tests
        run: |
          cd apps/api
          npm run test
          npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run Frontend tests
        run: |
          cd apps/web
          npm run test
      
      - name: Build applications
        run: |
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/rukny-io
            git pull origin main
            npm ci
            npm run build
            docker-compose down
            docker-compose up -d --build
            # Run database migrations
            docker-compose exec api npx prisma migrate deploy
```

## Testing Strategy

### Testing Types

1. **Unit Testing**
   - Test individual services, utilities, and functions in isolation
   - Use Jest for both frontend and backend testing
   - Focus on business logic and data transformations

2. **Integration Testing**
   - Test API endpoints and database interactions
   - Test service integrations like payment processing
   - Use supertest for API testing in NestJS

3. **End-to-End Testing**
   - Test complete user workflows using Playwright
   - Cover critical paths like user registration, profile creation, and payments
   - Automated browser testing for UI interactions

### Example Test Cases

#### Backend Unit Test (NestJS)
```typescript
// profiles.service.spec.ts
describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a profile successfully', async () => {
    const createProfileDto = {
      username: 'testuser',
      bio: 'Test bio',
    };

    const mockProfile = {
      id: '1',
      ...createProfileDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.profile, 'create').mockResolvedValue(mockProfile);

    const result = await service.create(createProfileDto, 'user-id');

    expect(result).toEqual(mockProfile);
    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: {
        ...createProfileDto,
        userId: 'user-id',
      },
    });
  });
});
```

#### Frontend Component Test (React)
```typescript
// ProfileCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProfileCard } from './ProfileCard';

describe('ProfileCard', () => {
  const mockProfile = {
    id: '1',
    username: 'testuser',
    bio: 'Test bio',
    avatar: 'https://example.com/avatar.jpg',
  };

  it('should render profile information correctly', () => {
    render(<ProfileCard profile={mockProfile} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockProfile.avatar);
  });

  it('should handle missing avatar gracefully', () => {
    const profileWithoutAvatar = { ...mockProfile, avatar: null };
    
    render(<ProfileCard profile={profileWithoutAvatar} />);
    
    expect(screen.getByRole('img')).toHaveAttribute('src', '/default-avatar.png');
  });
});
```

#### E2E Test Example (Playwright)
```typescript
// profile-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Profile Creation', () => {
  test('user can create a new profile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');

    // Navigate to profile creation
    await page.goto('/dashboard/profile/create');
    
    // Fill profile form
    await page.fill('[data-testid=username]', 'testuser123');
    await page.fill('[data-testid=bio]', 'This is my test bio');
    
    // Submit form
    await page.click('[data-testid=create-profile-button]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard/profile/testuser123');
    await expect(page.locator('[data-testid=profile-username]')).toHaveText('testuser123');
    await expect(page.locator('[data-testid=profile-bio]')).toHaveText('This is my test bio');
  });
});
```

## Development Workflow

### Git Workflow

1. **Branch Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch for features
   - Feature branches: `feature/feature-name`
   - Bugfix branches: `bugfix/bug-description`
   - Release branches: `release/v1.x.x`

2. **Commit Guidelines**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, etc.
   - Include issue numbers in commit messages: `feat: add social link sharing (#123)`

3. **Pull Request Process**
   - Create PR from feature branch to develop
   - Require code reviews from at least one team member
   - Run automated tests (Jest, Playwright)
   - Merge using squash and merge strategy

### Local Development Setup

```bash
# Clone the repository
git clone https://repository-url.git rukny-io
cd rukny-io

# Install dependencies
npm install

# Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Setup database
cd apps/api
npx prisma migrate dev
npx prisma db seed

# Start development servers
cd ../..
npm run dev  # This starts both frontend and backend
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "cd apps/api && npm run start:dev",
    "dev:web": "cd apps/web && npm run dev",
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd apps/api && npm run build",
    "build:web": "cd apps/web && npm run build",
    "test": "npm run test:api && npm run test:web",
    "test:api": "cd apps/api && npm run test",
    "test:web": "cd apps/web && npm run test",
    "test:e2e": "cd apps/web && npm run test:e2e",
    "db:migrate": "cd apps/api && npx prisma migrate dev",
    "db:seed": "cd apps/api && npx prisma db seed",
    "db:studio": "cd apps/api && npx prisma studio"
  }
}
```

### Quality Assurance

1. **Code Style**
   - Use Prettier for code formatting
   - ESLint for JavaScript/TypeScript linting
   - Husky for pre-commit hooks

2. **Pre-commit Configuration**
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

3. **Code Reviews**
   - Focus on business logic correctness
   - Check for security vulnerabilities
   - Ensure proper error handling
   - Verify test coverage
   - TypeScript type safety

---

This document serves as a comprehensive guide for developing and maintaining the **Rukny.io** platform. It should be updated regularly as the project evolves with the modern Next.js and NestJS architecture.