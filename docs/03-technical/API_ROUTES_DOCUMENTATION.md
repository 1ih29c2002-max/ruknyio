# API Routes Documentation | توثيق مسارات API

## 📌 Base URL
```
Development: http://localhost:3001/api
Production: https://api.rukny.io
```

---

## 🔐 Authentication Routes

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "password123"
}

Response 201:
{
  "user": {
    "id": "uuid",
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "role": "BASIC"
  },
  "access_token": "jwt_token"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password123"
}

Response 200:
{
  "user": { ... },
  "access_token": "jwt_token"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "role": "BASIC"
}
```

---

## 👤 Profile Routes

### Create Profile
```http
POST /api/profiles
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "ahmed_dev",
  "bio": "Full Stack Developer",
  "avatar": "https://cloudinary.com/...",
  "visibility": "PUBLIC"
}

Response 201:
{
  "id": "uuid",
  "username": "ahmed_dev",
  "bio": "Full Stack Developer",
  "avatar": "...",
  "visibility": "PUBLIC"
}
```

### Get Profile by Username
```http
GET /api/profiles/{username}

Response 200:
{
  "id": "uuid",
  "username": "ahmed_dev",
  "bio": "...",
  "avatar": "...",
  "socialLinks": [...],
  "stores": [...],
  "events": [...]
}
```

### Update Profile
```http
PATCH /api/profiles/{id}
Authorization: Bearer {token}

{
  "bio": "Updated bio",
  "visibility": "PRIVATE"
}
```

### Delete Profile
```http
DELETE /api/profiles/{id}
Authorization: Bearer {token}

Response 200:
{
  "message": "Profile deleted successfully"
}
```

---

## 🔗 Social Links Routes

### Add Social Link
```http
POST /api/profiles/{profileId}/social-links
Authorization: Bearer {token}

{
  "platform": "TWITTER",
  "url": "https://twitter.com/ahmed_dev",
  "label": "Twitter Profile"
}

Response 201:
{
  "id": "uuid",
  "platform": "TWITTER",
  "url": "...",
  "label": "..."
}
```

### Get All Social Links
```http
GET /api/profiles/{profileId}/social-links

Response 200:
[
  {
    "id": "uuid",
    "platform": "TWITTER",
    "url": "...",
    "label": "..."
  }
]
```

### Update Social Link
```http
PATCH /api/social-links/{id}
Authorization: Bearer {token}

{
  "url": "https://twitter.com/new_handle"
}
```

### Delete Social Link
```http
DELETE /api/social-links/{id}
Authorization: Bearer {token}
```

---

## 🔗 URL Shortener Routes

### Create Short URL
```http
POST /api/short-urls
Authorization: Bearer {token}

{
  "originalUrl": "https://example.com/very/long/url",
  "customSlug": "my-link" // optional
}

Response 201:
{
  "id": "uuid",
  "originalUrl": "...",
  "shortCode": "abc123",
  "customSlug": "my-link",
  "shortUrl": "https://rukny.io/l/my-link",
  "clicks": 0
}
```

### Redirect Short URL
```http
GET /l/{slug}

Response 302:
Redirects to original URL
```

### Get Short URL Stats
```http
GET /api/short-urls/{id}/stats
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "shortUrl": "...",
  "clicks": 150,
  "createdAt": "...",
  "lastClickedAt": "..."
}
```

---

## 🏪 Store Routes

### Create Store
```http
POST /api/stores
Authorization: Bearer {token}

{
  "name": "Ahmed's Store",
  "slug": "ahmed-store",
  "description": "Best products here",
  "logo": "https://cloudinary.com/...",
  "currency": "USD",
  "status": "ACTIVE"
}

Response 201:
{
  "id": "uuid",
  "name": "Ahmed's Store",
  "slug": "ahmed-store",
  "description": "...",
  "currency": "USD",
  "status": "ACTIVE"
}
```

### Get All Stores (Public)
```http
GET /api/stores?page=1&limit=10&search=electronics

Response 200:
{
  "stores": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Get Store by Slug
```http
GET /api/stores/{slug}

Response 200:
{
  "id": "uuid",
  "name": "Ahmed's Store",
  "slug": "ahmed-store",
  "products": [...]
}
```

### Update Store
```http
PATCH /api/stores/{id}
Authorization: Bearer {token}

{
  "name": "Updated Store Name",
  "status": "INACTIVE"
}
```

### Delete Store
```http
DELETE /api/stores/{id}
Authorization: Bearer {token}
```

---

## 📦 Product Routes

### Create Product
```http
POST /api/products
Authorization: Bearer {token}

{
  "storeId": "store-uuid",
  "name": "Laptop HP",
  "slug": "laptop-hp-15",
  "description": "High performance laptop",
  "price": 999.99,
  "stock": 10,
  "images": ["url1", "url2"],
  "category": "Electronics",
  "status": "ACTIVE"
}

Response 201:
{
  "id": "uuid",
  "name": "Laptop HP",
  "slug": "laptop-hp-15",
  "price": 999.99,
  "stock": 10
}
```

### Get Products by Store
```http
GET /api/stores/{storeId}/products?page=1&limit=10

Response 200:
{
  "products": [...],
  "total": 25,
  "page": 1
}
```

### Get Product by Slug
```http
GET /api/products/{slug}

Response 200:
{
  "id": "uuid",
  "name": "Laptop HP",
  "description": "...",
  "price": 999.99,
  "stock": 10,
  "images": [...],
  "store": { ... }
}
```

### Update Product
```http
PATCH /api/products/{id}
Authorization: Bearer {token}

{
  "price": 899.99,
  "stock": 15
}
```

### Delete Product
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

---

## 🎉 Event Routes

### Create Event
```http
POST /api/events
Authorization: Bearer {token}

{
  "title": "Tech Conference 2025",
  "slug": "tech-conf-2025",
  "description": "Annual tech conference",
  "startDate": "2025-12-01T09:00:00Z",
  "endDate": "2025-12-01T18:00:00Z",
  "location": "Dubai, UAE",
  "maxAttendees": 100,
  "price": 50,
  "status": "PUBLISHED"
}

Response 201:
{
  "id": "uuid",
  "title": "Tech Conference 2025",
  "slug": "tech-conf-2025",
  "startDate": "...",
  "maxAttendees": 100,
  "registeredCount": 0
}
```

### Get All Events
```http
GET /api/events?page=1&status=PUBLISHED&startDate=2025-12-01

Response 200:
{
  "events": [...],
  "total": 15,
  "page": 1
}
```

### Get Event by Slug
```http
GET /api/events/{slug}

Response 200:
{
  "id": "uuid",
  "title": "Tech Conference 2025",
  "description": "...",
  "startDate": "...",
  "registeredCount": 45,
  "maxAttendees": 100,
  "organizer": { ... }
}
```

### Register for Event
```http
POST /api/events/{eventId}/register
Authorization: Bearer {token}

{
  "attendeeInfo": {
    "fullName": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "+971501234567"
  }
}

Response 201:
{
  "id": "uuid",
  "eventId": "...",
  "status": "CONFIRMED",
  "ticketNumber": "TICKET-12345"
}
```

### Get Event Registrations (Owner only)
```http
GET /api/events/{eventId}/registrations
Authorization: Bearer {token}

Response 200:
{
  "registrations": [...],
  "total": 45
}
```

---

## 💳 Payment Routes

### Create Checkout Session
```http
POST /api/payments/checkout
Authorization: Bearer {token}

{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2
    }
  ],
  "successUrl": "https://rukny.io/success",
  "cancelUrl": "https://rukny.io/cancel"
}

Response 200:
{
  "sessionId": "stripe_session_id",
  "url": "https://checkout.stripe.com/..."
}
```

### Webhook Handler
```http
POST /api/payments/webhook
Stripe-Signature: ...

{
  "type": "checkout.session.completed",
  "data": { ... }
}

Response 200:
{
  "received": true
}
```

---

## 💰 Subscription Routes

### Get Subscription Plans
```http
GET /api/subscriptions/plans

Response 200:
[
  {
    "name": "BASIC",
    "price": 0,
    "features": [...]
  },
  {
    "name": "PREMIUM",
    "price": 29.99,
    "features": [...]
  },
  {
    "name": "PRO",
    "price": 99.99,
    "features": [...]
  }
]
```

### Subscribe to Plan
```http
POST /api/subscriptions/subscribe
Authorization: Bearer {token}

{
  "plan": "PREMIUM"
}

Response 200:
{
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

### Get Current Subscription
```http
GET /api/subscriptions/current
Authorization: Bearer {token}

Response 200:
{
  "id": "uuid",
  "plan": "PREMIUM",
  "status": "ACTIVE",
  "currentPeriodEnd": "2026-01-24"
}
```

### Cancel Subscription
```http
POST /api/subscriptions/cancel
Authorization: Bearer {token}

Response 200:
{
  "message": "Subscription cancelled",
  "endsAt": "2026-01-24"
}
```

---

## 📊 Analytics Routes

### Track Event
```http
POST /api/analytics/events
Authorization: Bearer {token}

{
  "eventName": "button_click",
  "properties": {
    "buttonId": "checkout",
    "page": "/products/123"
  }
}

Response 201:
{
  "tracked": true
}
```

### Get Dashboard Analytics
```http
GET /api/analytics/dashboard?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {token}

Response 200:
{
  "profileViews": 1500,
  "storeViews": 850,
  "productViews": 2300,
  "linkClicks": 450,
  "revenue": 15000,
  "chartData": [...]
}
```

### Get Store Analytics
```http
GET /api/analytics/stores/{storeId}
Authorization: Bearer {token}

Response 200:
{
  "views": 850,
  "sales": 120,
  "revenue": 12000,
  "topProducts": [...]
}
```

---

## 🏥 Health & Monitoring Routes

### Health Check
```http
GET /api/health

Response 200:
{
  "status": "ok",
  "timestamp": "2025-10-24T10:00:00Z",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Metrics
```http
GET /api/metrics
Authorization: Bearer {admin_token}

Response 200:
{
  "requests": 15000,
  "errors": 12,
  "responseTime": 45,
  "activeUsers": 250
}
```

---

## 📤 File Upload Routes

### Upload Image
```http
POST /api/upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]

Response 200:
{
  "url": "https://cloudinary.com/...",
  "publicId": "rukny/user123/image456",
  "width": 1920,
  "height": 1080
}
```

---

## 🔍 Search Routes

### Global Search
```http
GET /api/search?q=laptop&type=products&page=1&limit=10

Response 200:
{
  "results": [
    {
      "type": "product",
      "id": "uuid",
      "name": "Laptop HP",
      "slug": "laptop-hp-15",
      "relevance": 0.95
    }
  ],
  "total": 25
}
```

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 🔐 Authentication Headers

جميع الـ Routes المحمية تحتاج:
```http
Authorization: Bearer {jwt_token}
```

---

## 📊 Pagination

```http
GET /api/products?page=1&limit=10&sortBy=createdAt&order=desc

Response:
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 🎯 Rate Limiting

- **Public endpoints:** 100 requests / 15 minutes
- **Authenticated endpoints:** 500 requests / 15 minutes
- **Upload endpoints:** 20 requests / 15 minutes

Headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## 📚 API Versioning

```http
GET /api/v1/profiles
GET /api/v2/profiles
```

---

تم التوثيق بتاريخ: 24 أكتوبر 2025
