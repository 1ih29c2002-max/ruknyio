# Naming Conventions Guide

## Current State Analysis

The Rukny.io project has **inconsistent naming conventions** in the Prisma schema:

### PascalCase Models (Correct ✅)
These models follow the recommended Prisma convention:
- `User`, `Profile`, `SocialLink`, `LinkGroup`
- `Session`, `SecurityLog`, `Store`, `Event`
- `EventCategory`, `EventRegistration`, `EventReview`
- `EventWaitlist`, `EventTicket`, `EventOrganizer`, `EventSponsor`
- `Form`, `FormIntegration`, `FormField`
- `UserFile`, `TelegramSession`, `TelegramWebhookLog`

### snake_case Models (Needs Refactoring ⚠️)
These models use snake_case which is non-standard for Prisma:
- `addresses` → Should be `Address`
- `calendar_integrations` → Should be `CalendarIntegration`
- `cart_items` → Should be `CartItem`
- `carts` → Should be `Cart`
- `comments` → Should be `Comment`
- `coupon_usages` → Should be `CouponUsage`
- `coupons` → Should be `Coupon`
- `follows` → Should be `Follow`
- `likes` → Should be `Like`
- `link_analytics` → Should be `LinkAnalytic`
- `notifications` → Should be `Notification`
- `orders` → Should be `Order`
- `order_items` → Should be `OrderItem`
- `posts` → Should be `Post`
- `products` → Should be `Product`
- `product_categories` → Should be `ProductCategory`
- `product_images` → Should be `ProductImage`
- `product_variants` → Should be `ProductVariant`
- `quicksign_links` → Should be `QuicksignLink`
- `reviews` → Should be `Review`
- `security_preferences` → Should be `SecurityPreference`
- `trusted_devices` → Should be `TrustedDevice`
- `verification_codes` → Should be `VerificationCode`
- `wishlists` → Should be `Wishlist`
- `form_submissions` → Should be `FormSubmission`

## Recommended Conventions

### 1. Model Names (PascalCase)
```prisma
model User {         // ✅ Correct
model addresses {    // ❌ Wrong - should be Address
```

### 2. Field Names (camelCase)
```prisma
model User {
  firstName String   // ✅ Correct
  first_name String  // ❌ Wrong
}
```

### 3. Database Table Names (snake_case via @@map)
```prisma
model EventRegistration {
  // fields...
  @@map("event_registrations")  // Maps to snake_case in PostgreSQL
}
```

### 4. Database Column Names (snake_case via @map)
```prisma
model User {
  firstName String @map("first_name")  // Maps to snake_case column
  lastName  String @map("last_name")
}
```

### 5. Enum Names (PascalCase with SCREAMING_SNAKE values)
```prisma
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### 6. Relation Names (camelCase)
```prisma
model User {
  orders Order[]  // ✅ Plural camelCase for one-to-many
  profile Profile? // ✅ Singular for one-to-one
}
```

## Migration Plan

### Phase 1: Document & Plan (Low Risk)
1. Create this documentation ✅
2. Identify all affected models
3. Map all code references (services, controllers, DTOs)

### Phase 2: Create Migration Script
```bash
# Generate migration without applying
npx prisma migrate dev --create-only --name standardize_model_names
```

### Phase 3: Update Code References
For each model being renamed:
1. Update Prisma schema model name
2. Keep `@@map("original_table_name")` to preserve DB table
3. Update all TypeScript imports
4. Update all service/controller references
5. Run `npx prisma generate` to update client

### Phase 4: Example Refactoring

**Before:**
```prisma
model addresses {
  id     String @id
  userId String
  // ...
}
```

**After:**
```prisma
model Address {
  id     String @id
  userId String
  // ...
  
  @@map("addresses")  // Keeps same table name in DB
}
```

**Code Update:**
```typescript
// Before
const address = await prisma.addresses.findFirst({ ... });

// After
const address = await prisma.address.findFirst({ ... });
```

## Automation Script

Save as `scripts/audit-naming.ts`:

```typescript
import { readFileSync } from 'fs';

const schema = readFileSync('apps/api/prisma/schema.prisma', 'utf-8');
const modelRegex = /^model\s+(\w+)\s*{/gm;
const issues: string[] = [];

let match;
while ((match = modelRegex.exec(schema)) !== null) {
  const modelName = match[1];
  // Check if starts with lowercase (snake_case indicator)
  if (modelName[0] === modelName[0].toLowerCase()) {
    const pascalCase = modelName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    issues.push(`- ${modelName} → Should be ${pascalCase}`);
  }
}

if (issues.length > 0) {
  console.log('Models needing rename:');
  issues.forEach(i => console.log(i));
} else {
  console.log('All models follow PascalCase convention! ✅');
}
```

## Priority & Risk Assessment

| Risk Level | Description |
|------------|-------------|
| **LOW** | Adding `@@map` to new PascalCase models |
| **MEDIUM** | Renaming snake_case models with proper `@@map` |
| **HIGH** | Renaming without `@@map` (breaks DB) |

## Recommended Approach

1. **Don't break what works** - Keep existing snake_case models as-is for now
2. **New models only** - All new models should use PascalCase + `@@map`
3. **Gradual migration** - Rename models one-by-one during feature development
4. **Test thoroughly** - Each rename requires full testing of affected features

## Files Affected by Full Migration

Estimated impact for full standardization:
- ~25 model renames needed
- ~50+ service files to update
- ~30+ controller files to update
- ~40+ DTO files to update
- ~100+ test files to update

**Recommendation:** Add to technical debt backlog, implement gradually over 2-3 sprints.
