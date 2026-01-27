# 🛒 E-Commerce API Documentation

## 📋 Overview
Complete documentation for Rukny.io E-Commerce Backend APIs

**Base URL:** `http://localhost:3001/api`  
**Authentication:** Bearer Token (JWT)

---

## 🏪 Store Management

### Store Categories

#### Get All Store Categories
```http
GET /store-categories
```
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "nameAr": "إلكترونيات",
    "slug": "electronics",
    "icon": "🔌",
    "description": "Electronic devices and gadgets",
    "isActive": true,
    "_count": {
      "stores": 15
    }
  }
]
```

#### Create Store Category (Admin)
```http
POST /store-categories
Authorization: Bearer {token}
```

---

### Stores

#### Create Store
```http
POST /stores
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Store",
  "nameAr": "متجري",
  "slug": "my-store",
  "description": "Store description",
  "categoryId": "uuid",
  "contactEmail": "store@example.com",
  "contactPhone": "+9647XXXXXXXXX",
  "address": "Baghdad, Iraq",
  "city": "Baghdad"
}
```

#### Get All Stores
```http
GET /stores?page=1&limit=20&categoryId=uuid
```

#### Get My Stores
```http
GET /stores/my-stores
Authorization: Bearer {token}
```

#### Get Store by Slug
```http
GET /stores/slug/{slug}
```

#### Update Store
```http
PATCH /stores/{storeId}
Authorization: Bearer {token}
```

#### Upload Store Logo
```http
POST /stores/{storeId}/upload-logo
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
```

#### Upload Store Banner
```http
POST /stores/{storeId}/upload-banner
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
```

---

## 📦 Product Management

### Product Categories

#### Create Product Category
```http
POST /product-categories/{storeId}
Authorization: Bearer {token}

{
  "name": "Laptops",
  "nameAr": "لابتوبات",
  "slug": "laptops",
  "description": "All laptop models",
  "order": 1
}
```

#### Get Store Product Categories
```http
GET /product-categories/store/{storeId}
```

---

### Products

#### Create Product
```http
POST /products
Authorization: Bearer {token}

{
  "storeId": "uuid",
  "name": "MacBook Pro",
  "nameAr": "ماك بوك برو",
  "slug": "macbook-pro-2024",
  "description": "Latest MacBook Pro",
  "price": 2500000,
  "quantity": 10,
  "categoryId": "uuid",
  "sku": "MBP-2024",
  "isFeatured": true
}
```

#### Advanced Product Search
```http
GET /products/search?q=laptop&minPrice=100000&maxPrice=5000000&rating=4&sortBy=price-asc&page=1&limit=20
```

**Query Parameters:**
- `q`: Search query
- `storeId`: Filter by store
- `categoryId`: Filter by category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `rating`: Minimum rating (1-5)
- `inStock`: true/false
- `sortBy`: newest | price-asc | price-desc | popular | rating
- `page`: Page number
- `limit`: Items per page

#### Get Featured Products
```http
GET /products/featured?limit=10
```

#### Get Trending Products
```http
GET /products/trending?limit=10
```

#### Get Products by Store
```http
GET /products/store/{storeId}?page=1&limit=20&categoryId=uuid&search=laptop
```

#### Get Product by Slug
```http
GET /products/slug/{slug}
```

#### Update Product
```http
PATCH /products/{productId}
Authorization: Bearer {token}
```

#### Upload Product Images
```http
POST /products/{productId}/upload-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: (multiple files)
```

#### Delete Product Image
```http
DELETE /products/{productId}/images/{imageId}
Authorization: Bearer {token}
```

#### Set Primary Image
```http
PATCH /products/{productId}/images/{imageId}/set-primary
Authorization: Bearer {token}
```

---

## 🛒 Shopping Cart

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer {token}

{
  "productId": "uuid",
  "quantity": 2
}
```

#### Get Cart
```http
GET /cart
Authorization: Bearer {token}
```

**Response:**
```json
{
  "cart": {
    "id": "uuid",
    "userId": "uuid"
  },
  "items": [
    {
      "id": "uuid",
      "quantity": 2,
      "subtotal": 5000000,
      "product": {
        "id": "uuid",
        "name": "MacBook Pro",
        "price": 2500000,
        "images": [...],
        "store": {...}
      }
    }
  ],
  "storeGroups": [...],
  "summary": {
    "itemsCount": 3,
    "totalQuantity": 5,
    "total": 8500000,
    "currency": "IQD"
  }
}
```

#### Update Cart Item
```http
PATCH /cart/items/{itemId}
Authorization: Bearer {token}

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /cart/items/{itemId}
Authorization: Bearer {token}
```

#### Clear Cart
```http
DELETE /cart/clear
Authorization: Bearer {token}
```

---

## 📋 Orders

#### Checkout
```http
POST /orders/checkout
Authorization: Bearer {token}

{
  "addressId": "uuid",
  "customerNote": "Please deliver before 5 PM",
  "couponCode": "SAVE20",
  "shippingFee": 5000
}
```

**Response:**
```json
{
  "message": "Checkout successful",
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "ORD-20241124-1234",
      "total": 2505000,
      "status": "PENDING",
      "items": [...],
      "store": {...},
      "address": {...}
    }
  ],
  "totalAmount": 2505000
}
```

#### Get User Orders
```http
GET /orders/my-orders?page=1&limit=10
Authorization: Bearer {token}
```

#### Get Store Orders (Seller)
```http
GET /orders/store/{storeId}?page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single Order
```http
GET /orders/{orderId}
Authorization: Bearer {token}
```

#### Update Order Status (Seller)
```http
PATCH /orders/{orderId}/status
Authorization: Bearer {token}

{
  "status": "CONFIRMED",
  "storeNote": "Processing your order"
}
```

**Order Statuses:**
- `PENDING` - New order
- `CONFIRMED` - Confirmed by seller
- `PROCESSING` - Being prepared
- `SHIPPED` - Shipped
- `OUT_FOR_DELIVERY` - Out for delivery
- `DELIVERED` - Delivered
- `CANCELLED` - Cancelled

#### Cancel Order (Customer)
```http
POST /orders/{orderId}/cancel
Authorization: Bearer {token}

{
  "reason": "Changed my mind"
}
```

---

## 💰 Coupons

#### Create Coupon
```http
POST /coupons
Authorization: Bearer {token}

{
  "code": "SAVE20",
  "description": "Save 20% on all products",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrderAmount": 100000,
  "maxDiscount": 50000,
  "usageLimit": 100,
  "perUserLimit": 1,
  "startDate": "2024-11-01",
  "endDate": "2024-12-31",
  "storeId": "uuid"
}
```

**Discount Types:**
- `PERCENTAGE`: Percentage discount (1-100%)
- `FIXED_AMOUNT`: Fixed amount discount
- `FREE_SHIPPING`: Free shipping

#### Get Active Coupons
```http
GET /coupons/active?storeId=uuid
```

#### Validate Coupon
```http
POST /coupons/validate
Authorization: Bearer {token}

{
  "code": "SAVE20",
  "orderAmount": 500000
}
```

**Response:**
```json
{
  "couponId": "uuid",
  "code": "SAVE20",
  "discountType": "PERCENTAGE",
  "discountAmount": 100000,
  "freeShipping": false,
  "finalAmount": 400000,
  "message": "Coupon applied successfully"
}
```

---

## ⭐ Reviews

#### Create Review
```http
POST /reviews
Authorization: Bearer {token}

{
  "productId": "uuid",
  "rating": 5,
  "comment": "Excellent product!"
}
```

#### Get Product Reviews
```http
GET /reviews/product/{productId}?page=1&limit=10
```

**Response:**
```json
{
  "reviews": [...],
  "pagination": {...},
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "ratingDistribution": {
      "1": 1,
      "2": 2,
      "3": 5,
      "4": 7,
      "5": 10
    }
  }
}
```

#### Get User Reviews
```http
GET /reviews/my-reviews
Authorization: Bearer {token}
```

#### Update Review
```http
PATCH /reviews/{reviewId}
Authorization: Bearer {token}

{
  "rating": 4,
  "comment": "Good but pricey"
}
```

#### Delete Review
```http
DELETE /reviews/{reviewId}
Authorization: Bearer {token}
```

---

## ❤️ Wishlist

#### Add to Wishlist
```http
POST /wishlist/add
Authorization: Bearer {token}

{
  "productId": "uuid"
}
```

#### Get Wishlist
```http
GET /wishlist
Authorization: Bearer {token}
```

#### Remove from Wishlist
```http
DELETE /wishlist/{productId}
Authorization: Bearer {token}
```

#### Clear Wishlist
```http
DELETE /wishlist/clear
Authorization: Bearer {token}
```

---

## 📍 Addresses

#### Create Address
```http
POST /addresses
Authorization: Bearer {token}

{
  "recipientName": "John Doe",
  "phone": "+9647XXXXXXXXX",
  "governorate": "Baghdad",
  "city": "Karrada",
  "district": "District 1",
  "street": "Main Street",
  "building": "Building 5",
  "floor": "3rd Floor",
  "apartment": "Apt 12",
  "nearbyLandmark": "Near Central Market",
  "isDefault": true
}
```

#### Get User Addresses
```http
GET /addresses
Authorization: Bearer {token}
```

#### Update Address
```http
PATCH /addresses/{addressId}
Authorization: Bearer {token}
```

#### Set Default Address
```http
PATCH /addresses/{addressId}/set-default
Authorization: Bearer {token}
```

#### Delete Address
```http
DELETE /addresses/{addressId}
Authorization: Bearer {token}
```

---

## 📊 Analytics (Store Owner)

#### Get Store Overview
```http
GET /analytics/stores/{storeId}/overview
Authorization: Bearer {token}
```

**Response:**
```json
{
  "overview": {
    "totalProducts": 50,
    "activeProducts": 45,
    "outOfStockProducts": 5,
    "lowStockProducts": 8
  },
  "orders": {
    "total": 150,
    "thisMonth": 25,
    "pending": 5,
    "growth": 15.5
  },
  "revenue": {
    "total": 75000000,
    "thisMonth": 12500000,
    "lastMonth": 10000000,
    "growth": 25.0,
    "currency": "IQD"
  },
  "reviews": {
    "total": 80,
    "averageRating": 4.5
  }
}
```

#### Get Sales Analytics
```http
GET /analytics/stores/{storeId}/sales?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer {token}
```

#### Get Top Selling Products
```http
GET /analytics/stores/{storeId}/products/top-selling?limit=10
Authorization: Bearer {token}
```

#### Get Revenue Analytics
```http
GET /analytics/stores/{storeId}/revenue?year=2024
Authorization: Bearer {token}
```

#### Get Customer Analytics
```http
GET /analytics/stores/{storeId}/customers
Authorization: Bearer {token}
```

---

## 🔔 Notifications

Automatic notifications are sent for:

### Customer Notifications
- ✅ Order confirmed
- 📦 Order shipped
- 🚚 Out for delivery
- ✔️ Order delivered
- ❌ Order cancelled

### Store Owner Notifications
- 🛒 New order received
- ⭐ New review received
- ⚠️ Low stock warning (< 10 items)
- 🚫 Out of stock alert

---

## 🔐 Authentication

All protected endpoints require Bearer token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 409  | Conflict |
| 500  | Server Error |

---

## 💡 Best Practices

1. **Pagination**: Use `page` and `limit` for large datasets
2. **File Uploads**: Max 5MB for images, 10MB for banners
3. **Search**: Use debouncing for search queries
4. **Caching**: Cache frequently accessed data
5. **Error Handling**: Check response status codes
6. **Rate Limiting**: Max 30 requests/minute (production)

---

## 🚀 Quick Start Example

```javascript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { access_token } = await loginRes.json();

// 2. Create Store
const storeRes = await fetch('/api/stores', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Store',
    slug: 'my-store',
    // ... other fields
  })
});

// 3. Add Product
const productRes = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    storeId: store.id,
    name: 'Product Name',
    price: 100000,
    // ... other fields
  })
});

// 4. Search Products
const searchRes = await fetch('/api/products/search?q=laptop&sortBy=price-asc');
const { products, pagination } = await searchRes.json();
```

---

## 📞 Support

For API support, contact: dev@rukny.io

---

**Last Updated:** November 24, 2024  
**Version:** 1.0.0
