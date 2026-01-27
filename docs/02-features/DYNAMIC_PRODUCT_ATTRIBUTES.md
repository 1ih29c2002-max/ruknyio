# 📦 نظام الخصائص الديناميكية للمنتجات

## Dynamic Product Attributes System

---

## 🎯 نظرة عامة

نظام مرن يعرض حقول مختلفة عند إضافة منتج بناءً على تصنيف المتجر. يسمح لأصحاب المتاجر بإدخال معلومات متخصصة حسب نوع المنتجات التي يبيعونها.

```
┌─────────────────────────────────────────────────────────────┐
│  تصنيف المتجر → يحدد الحقول المطلوبة عند إضافة منتج         │
│                                                             │
│  متجر ملابس → مقاسات + ألوان + جنس                          │
│  متجر كتب → طريقة التسليم + اللغة + المؤلف                  │
│  متجر طعام → تاريخ الصلاحية + طريقة التخزين                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 هيكل قاعدة البيانات

### 1️⃣ جدول `store_categories` (موجود - تحديث)

```prisma
model store_categories {
  id             String   @id
  name           String
  nameAr         String
  slug           String   @unique
  description    String?
  descriptionAr  String?
  icon           String?
  color          String   @default("#6366f1")
  templateFields Json?    // ← الحقول الديناميكية لكل تصنيف
  order          Int      @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime
  stores         Store[]
}
```

### 2️⃣ جدول جديد `product_variants`

```prisma
model product_variants {
  id             String   @id @default(uuid())
  productId      String
  product        Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  sku            String?  // رمز المتغير الفريد (SHIRT-RED-L)
  barcode        String?  // باركود المتغير
  
  price          Decimal? @db.Decimal(10, 2) // سعر خاص (null = سعر المنتج الأساسي)
  compareAtPrice Decimal? @db.Decimal(10, 2) // سعر قبل الخصم
  cost           Decimal? @db.Decimal(10, 2) // التكلفة
  
  stock          Int      @default(0)        // المخزون
  lowStockAlert  Int      @default(5)        // تنبيه انخفاض المخزون
  
  attributes     Json     // {color: "أحمر", size: "L"}
  imageUrl       String?  // صورة خاصة بالمتغير
  
  weight         Decimal? @db.Decimal(8, 2)  // الوزن بالكيلوغرام
  
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Indexes
  @@unique([productId, sku])
  @@index([productId])
  @@index([sku])
  @@index([isActive])
}
```

### 3️⃣ جدول جديد `product_attributes`

```prisma
model product_attributes {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  key       String   // مثال: "delivery_method", "warranty"
  value     String   // مثال: "PDF", "1year"
  valueAr   String?  // القيمة بالعربية (اختياري)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, key])
  @@index([productId])
  @@index([key])
}
```

### 4️⃣ تحديث جدول `Product`

```prisma
model Product {
  // ... الحقول الموجودة ...
  
  // العلاقات الجديدة
  variants   product_variants[]
  attributes product_attributes[]
  
  // حقول جديدة
  hasVariants    Boolean @default(false)  // هل المنتج له متغيرات؟
  trackInventory Boolean @default(true)   // تتبع المخزون؟
}
```

---

## 🏷️ تعريف الحقول لكل تصنيف (templateFields)

### 👕 الأزياء والموضة (Fashion)

```json
{
  "hasVariants": true,
  "variantOptions": [
    {
      "name": "size",
      "nameAr": "المقاس",
      "type": "select",
      "options": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
      "required": true
    },
    {
      "name": "color",
      "nameAr": "اللون",
      "type": "color",
      "required": true
    }
  ],
  "attributes": [
    {
      "name": "gender",
      "nameAr": "الجنس",
      "type": "select",
      "options": [
        {"value": "men", "label": "رجالي"},
        {"value": "women", "label": "نسائي"},
        {"value": "kids", "label": "أطفال"},
        {"value": "unisex", "label": "للجنسين"}
      ],
      "required": true
    },
    {
      "name": "material",
      "nameAr": "الخامة",
      "type": "text",
      "placeholder": "مثال: قطن 100%",
      "required": false
    },
    {
      "name": "productType",
      "nameAr": "نوع المنتج",
      "type": "select",
      "options": [
        {"value": "clothing", "label": "ملابس"},
        {"value": "shoes", "label": "أحذية"},
        {"value": "accessories", "label": "إكسسوارات"},
        {"value": "bags", "label": "حقائب"}
      ],
      "required": true
    }
  ],
  "shoesSizes": ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"]
}
```

### 📚 الكتب والتعليم (Books & Education)

```json
{
  "hasVariants": false,
  "attributes": [
    {
      "name": "deliveryMethod",
      "nameAr": "طريقة التسليم",
      "type": "select",
      "options": [
        {"value": "pdf", "label": "PDF إلكتروني", "icon": "FileText"},
        {"value": "printed", "label": "نسخة ورقية", "icon": "Book"},
        {"value": "both", "label": "إلكتروني + ورقي", "icon": "Package"}
      ],
      "required": true
    },
    {
      "name": "language",
      "nameAr": "اللغة",
      "type": "select",
      "options": [
        {"value": "ar", "label": "العربية"},
        {"value": "en", "label": "الإنجليزية"},
        {"value": "ku", "label": "الكردية"},
        {"value": "other", "label": "أخرى"}
      ],
      "required": true
    },
    {
      "name": "author",
      "nameAr": "المؤلف",
      "type": "text",
      "required": false
    },
    {
      "name": "publisher",
      "nameAr": "دار النشر",
      "type": "text",
      "required": false
    },
    {
      "name": "pages",
      "nameAr": "عدد الصفحات",
      "type": "number",
      "min": 1,
      "required": false
    },
    {
      "name": "isbn",
      "nameAr": "ISBN",
      "type": "text",
      "pattern": "^[0-9-]{10,17}$",
      "required": false
    },
    {
      "name": "publishYear",
      "nameAr": "سنة النشر",
      "type": "number",
      "min": 1900,
      "max": 2030,
      "required": false
    }
  ]
}
```

### 💄 الجمال والصحة (Beauty & Health)

```json
{
  "hasVariants": true,
  "variantOptions": [
    {
      "name": "size",
      "nameAr": "الحجم",
      "type": "select",
      "options": ["30ml", "50ml", "100ml", "150ml", "200ml", "250ml", "500ml", "1L"],
      "required": false
    },
    {
      "name": "shade",
      "nameAr": "الدرجة",
      "type": "color",
      "required": false
    }
  ],
  "attributes": [
    {
      "name": "skinType",
      "nameAr": "نوع البشرة",
      "type": "multiselect",
      "options": [
        {"value": "all", "label": "جميع الأنواع"},
        {"value": "dry", "label": "جافة"},
        {"value": "oily", "label": "دهنية"},
        {"value": "combination", "label": "مختلطة"},
        {"value": "sensitive", "label": "حساسة"}
      ],
      "required": false
    },
    {
      "name": "ingredients",
      "nameAr": "المكونات",
      "type": "textarea",
      "maxLength": 2000,
      "required": false
    },
    {
      "name": "howToUse",
      "nameAr": "طريقة الاستخدام",
      "type": "textarea",
      "maxLength": 1000,
      "required": false
    },
    {
      "name": "expiryDate",
      "nameAr": "تاريخ الصلاحية",
      "type": "date",
      "minDate": "today",
      "required": false
    },
    {
      "name": "brand",
      "nameAr": "الماركة",
      "type": "text",
      "required": false
    },
    {
      "name": "madeIn",
      "nameAr": "بلد المنشأ",
      "type": "text",
      "required": false
    }
  ]
}
```

### 🍔 الطعام والمشروبات (Food & Beverages)

```json
{
  "hasVariants": true,
  "variantOptions": [
    {
      "name": "size",
      "nameAr": "الحجم",
      "type": "select",
      "options": [
        {"value": "small", "label": "صغير"},
        {"value": "medium", "label": "وسط"},
        {"value": "large", "label": "كبير"},
        {"value": "family", "label": "عائلي"}
      ],
      "required": false
    }
  ],
  "attributes": [
    {
      "name": "weight",
      "nameAr": "الوزن/الحجم",
      "type": "text",
      "placeholder": "مثال: 500 غرام، 1 لتر",
      "required": false
    },
    {
      "name": "storageMethod",
      "nameAr": "طريقة التخزين",
      "type": "select",
      "options": [
        {"value": "room", "label": "درجة حرارة الغرفة", "icon": "Home"},
        {"value": "refrigerated", "label": "مبرد (2-8°C)", "icon": "Thermometer"},
        {"value": "frozen", "label": "مجمد (-18°C)", "icon": "Snowflake"}
      ],
      "required": true
    },
    {
      "name": "expiryDate",
      "nameAr": "تاريخ الصلاحية",
      "type": "date",
      "minDate": "today",
      "required": true
    },
    {
      "name": "calories",
      "nameAr": "السعرات الحرارية",
      "type": "number",
      "suffix": "كالوري",
      "min": 0,
      "required": false
    },
    {
      "name": "allergens",
      "nameAr": "المواد المسببة للحساسية",
      "type": "multiselect",
      "options": [
        {"value": "gluten", "label": "الجلوتين"},
        {"value": "dairy", "label": "الألبان"},
        {"value": "nuts", "label": "المكسرات"},
        {"value": "eggs", "label": "البيض"},
        {"value": "soy", "label": "الصويا"},
        {"value": "none", "label": "لا يوجد"}
      ],
      "required": false
    },
    {
      "name": "isHalal",
      "nameAr": "حلال",
      "type": "boolean",
      "default": true
    }
  ]
}
```

### 🔧 الخدمات (Services)

```json
{
  "hasVariants": false,
  "isService": true,
  "hideStock": true,
  "attributes": [
    {
      "name": "duration",
      "nameAr": "مدة الخدمة",
      "type": "select",
      "options": [
        {"value": "15min", "label": "15 دقيقة"},
        {"value": "30min", "label": "30 دقيقة"},
        {"value": "1hour", "label": "ساعة"},
        {"value": "2hours", "label": "ساعتين"},
        {"value": "3hours", "label": "3 ساعات"},
        {"value": "halfday", "label": "نصف يوم"},
        {"value": "fullday", "label": "يوم كامل"},
        {"value": "custom", "label": "حسب الاتفاق"}
      ],
      "required": true
    },
    {
      "name": "deliveryType",
      "nameAr": "طريقة التقديم",
      "type": "select",
      "options": [
        {"value": "online", "label": "أونلاين", "icon": "Video"},
        {"value": "onsite", "label": "حضوري", "icon": "MapPin"},
        {"value": "home", "label": "في المنزل", "icon": "Home"},
        {"value": "both", "label": "أونلاين + حضوري", "icon": "Layers"}
      ],
      "required": true
    },
    {
      "name": "serviceArea",
      "nameAr": "منطقة الخدمة",
      "type": "multiselect",
      "options": [
        {"value": "baghdad", "label": "بغداد"},
        {"value": "basra", "label": "البصرة"},
        {"value": "erbil", "label": "أربيل"},
        {"value": "sulaymaniyah", "label": "السليمانية"},
        {"value": "mosul", "label": "الموصل"},
        {"value": "najaf", "label": "النجف"},
        {"value": "karbala", "label": "كربلاء"},
        {"value": "all_iraq", "label": "جميع العراق"}
      ],
      "required": false
    },
    {
      "name": "bookingRequired",
      "nameAr": "يتطلب حجز مسبق",
      "type": "boolean",
      "default": true
    },
    {
      "name": "minBookingNotice",
      "nameAr": "الحد الأدنى للحجز المسبق",
      "type": "select",
      "options": [
        {"value": "none", "label": "بدون"},
        {"value": "1hour", "label": "ساعة"},
        {"value": "24hours", "label": "24 ساعة"},
        {"value": "48hours", "label": "48 ساعة"},
        {"value": "1week", "label": "أسبوع"}
      ],
      "showIf": {"bookingRequired": true}
    },
    {
      "name": "cancellationPolicy",
      "nameAr": "سياسة الإلغاء",
      "type": "select",
      "options": [
        {"value": "flexible", "label": "مرنة - استرداد كامل"},
        {"value": "moderate", "label": "معتدلة - استرداد 50%"},
        {"value": "strict", "label": "صارمة - بدون استرداد"}
      ],
      "required": false
    }
  ]
}
```

### 📱 الإلكترونيات (Electronics)

```json
{
  "hasVariants": true,
  "variantOptions": [
    {
      "name": "color",
      "nameAr": "اللون",
      "type": "color",
      "required": false
    },
    {
      "name": "storage",
      "nameAr": "السعة التخزينية",
      "type": "select",
      "options": ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
      "required": false
    },
    {
      "name": "ram",
      "nameAr": "الذاكرة العشوائية",
      "type": "select",
      "options": ["2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB"],
      "required": false
    }
  ],
  "attributes": [
    {
      "name": "brand",
      "nameAr": "الماركة",
      "type": "text",
      "required": false
    },
    {
      "name": "model",
      "nameAr": "الموديل",
      "type": "text",
      "required": false
    },
    {
      "name": "condition",
      "nameAr": "الحالة",
      "type": "select",
      "options": [
        {"value": "new", "label": "جديد", "badge": "success"},
        {"value": "like_new", "label": "شبه جديد", "badge": "info"},
        {"value": "used", "label": "مستعمل", "badge": "warning"},
        {"value": "refurbished", "label": "مجدد", "badge": "info"}
      ],
      "required": true
    },
    {
      "name": "warranty",
      "nameAr": "الضمان",
      "type": "select",
      "options": [
        {"value": "none", "label": "بدون ضمان"},
        {"value": "store", "label": "ضمان المتجر"},
        {"value": "3months", "label": "3 أشهر"},
        {"value": "6months", "label": "6 أشهر"},
        {"value": "1year", "label": "سنة"},
        {"value": "2years", "label": "سنتين"}
      ],
      "required": false
    },
    {
      "name": "serialNumber",
      "nameAr": "الرقم التسلسلي",
      "type": "text",
      "encrypted": true,
      "required": false
    },
    {
      "name": "imei",
      "nameAr": "IMEI",
      "type": "text",
      "pattern": "^[0-9]{15}$",
      "encrypted": true,
      "showIf": {"productType": "phone"},
      "required": false
    }
  ]
}
```

### 🏠 المنزل والحديقة (Home & Garden)

```json
{
  "hasVariants": true,
  "variantOptions": [
    {
      "name": "color",
      "nameAr": "اللون",
      "type": "color",
      "required": false
    },
    {
      "name": "size",
      "nameAr": "الحجم",
      "type": "text",
      "placeholder": "مثال: 120x80 سم",
      "required": false
    }
  ],
  "attributes": [
    {
      "name": "material",
      "nameAr": "الخامة",
      "type": "text",
      "required": false
    },
    {
      "name": "dimensions",
      "nameAr": "الأبعاد",
      "type": "text",
      "placeholder": "الطول × العرض × الارتفاع",
      "required": false
    },
    {
      "name": "weight",
      "nameAr": "الوزن",
      "type": "text",
      "placeholder": "مثال: 5 كغ",
      "required": false
    },
    {
      "name": "assemblyRequired",
      "nameAr": "يتطلب تجميع",
      "type": "boolean",
      "default": false
    },
    {
      "name": "roomType",
      "nameAr": "نوع الغرفة",
      "type": "multiselect",
      "options": [
        {"value": "living", "label": "غرفة المعيشة"},
        {"value": "bedroom", "label": "غرفة النوم"},
        {"value": "kitchen", "label": "المطبخ"},
        {"value": "bathroom", "label": "الحمام"},
        {"value": "office", "label": "المكتب"},
        {"value": "outdoor", "label": "خارجي"}
      ],
      "required": false
    }
  ]
}
```

---

## 🔄 سير العمل (Workflow)

### إنشاء متجر جديد:
```
┌──────────────────────────────────────────────────────────────────┐
│  1. المستخدم يختار تصنيف المتجر (مثال: ملابس)                    │
│                          ↓                                        │
│  2. النظام يحفظ categoryId مع المتجر                              │
│                          ↓                                        │
│  3. عند إضافة منتج، النظام يجلب templateFields من التصنيف        │
└──────────────────────────────────────────────────────────────────┘
```

### إضافة منتج جديد:
```
┌──────────────────────────────────────────────────────────────────┐
│  1. جلب templateFields من تصنيف المتجر                           │
│                          ↓                                        │
│  2. عرض النموذج الديناميكي:                                       │
│     ├── المعلومات الأساسية (اسم، وصف، سعر، صور)                  │
│     ├── الخصائص (attributes) من templateFields                   │
│     └── المتغيرات (variants) إذا hasVariants = true              │
│                          ↓                                        │
│  3. عند الحفظ:                                                    │
│     ├── حفظ المنتج في products                                   │
│     ├── حفظ الخصائص في product_attributes                        │
│     └── حفظ المتغيرات في product_variants (إذا وجدت)             │
└──────────────────────────────────────────────────────────────────┘
```

### عرض المنتج للعملاء:
```
┌──────────────────────────────────────────────────────────────────┐
│  1. جلب المنتج مع attributes و variants                          │
│                          ↓                                        │
│  2. عرض المتغيرات كخيارات (اللون، المقاس)                        │
│                          ↓                                        │
│  3. عند اختيار متغير:                                            │
│     ├── تحديث السعر (إذا مختلف)                                  │
│     ├── تحديث الصورة (إذا موجودة)                                │
│     └── تحديث حالة المخزون                                       │
│                          ↓                                        │
│  4. إضافة للسلة مع variantId                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 الأمان (Security)

### 1. التحقق من صحة المدخلات (Input Validation)

#### Backend (NestJS DTOs):
```typescript
// create-product-attribute.dto.ts
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export class CreateProductAttributeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: 'Key must start with letter and contain only alphanumeric characters',
  })
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }) => sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }))
  value: string;
}

// create-product-variant.dto.ts
export class CreateProductVariantDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'SKU must contain only uppercase letters, numbers, and hyphens',
  })
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999999)
  price?: number;

  @IsInt()
  @Min(0)
  @Max(999999)
  stock: number;

  @IsObject()
  @ValidateNested()
  attributes: Record<string, string>;
}
```

### 2. تشفير البيانات الحساسة (Data Encryption)

```typescript
// encryption.service.ts
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    this.key = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY'),
      'hex'
    );
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// استخدام التشفير للحقول الحساسة
// في product-attributes.service.ts
async createAttribute(productId: string, dto: CreateProductAttributeDto) {
  const templateField = await this.getTemplateField(productId, dto.key);
  
  let value = dto.value;
  
  // تشفير الحقول المحددة كحساسة
  if (templateField?.encrypted) {
    value = this.encryptionService.encrypt(dto.value);
  }
  
  return this.prisma.product_attributes.create({
    data: {
      productId,
      key: dto.key,
      value,
    },
  });
}
```

### 3. التحقق من الصلاحيات (Authorization)

```typescript
// products.guard.ts
@Injectable()
export class ProductOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const productId = request.params.productId || request.body.productId;

    if (!productId) return true;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.store.ownerId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    return true;
  }
}

// استخدام الـ Guard
@Controller('products/:productId/variants')
@UseGuards(JwtAuthGuard, ProductOwnerGuard)
export class ProductVariantsController {
  // ...
}
```

### 4. التحقق من صحة templateFields

```typescript
// template-validator.service.ts
@Injectable()
export class TemplateValidatorService {
  
  validateAttributes(
    templateFields: TemplateFields,
    attributes: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    
    for (const field of templateFields.attributes || []) {
      const value = attributes[field.name];
      
      // التحقق من الحقول المطلوبة
      if (field.required && !value) {
        errors.push(`الحقل "${field.nameAr}" مطلوب`);
        continue;
      }
      
      if (!value) continue;
      
      // التحقق من نوع البيانات
      switch (field.type) {
        case 'select':
          const validOptions = field.options.map(o => 
            typeof o === 'string' ? o : o.value
          );
          if (!validOptions.includes(value)) {
            errors.push(`قيمة غير صالحة للحقل "${field.nameAr}"`);
          }
          break;
          
        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`"${field.nameAr}" يجب أن يكون رقماً`);
          }
          if (field.min !== undefined && num < field.min) {
            errors.push(`"${field.nameAr}" يجب أن يكون أكبر من ${field.min}`);
          }
          if (field.max !== undefined && num > field.max) {
            errors.push(`"${field.nameAr}" يجب أن يكون أقل من ${field.max}`);
          }
          break;
          
        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`تاريخ غير صالح للحقل "${field.nameAr}"`);
          }
          if (field.minDate === 'today' && date < new Date()) {
            errors.push(`"${field.nameAr}" يجب أن يكون تاريخاً مستقبلياً`);
          }
          break;
          
        case 'text':
        case 'textarea':
          if (field.maxLength && value.length > field.maxLength) {
            errors.push(`"${field.nameAr}" يتجاوز الحد الأقصى للأحرف`);
          }
          if (field.pattern) {
            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
              errors.push(`تنسيق غير صالح للحقل "${field.nameAr}"`);
            }
          }
          break;
          
        case 'multiselect':
          if (!Array.isArray(value)) {
            errors.push(`"${field.nameAr}" يجب أن يكون قائمة`);
          } else {
            const validOptions = field.options.map(o => o.value);
            for (const v of value) {
              if (!validOptions.includes(v)) {
                errors.push(`قيمة غير صالحة في "${field.nameAr}"`);
              }
            }
          }
          break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

### 5. Rate Limiting للـ APIs

```typescript
// في Controller
@Controller('products')
export class ProductsController {
  
  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 منتج في الدقيقة
  async createProduct(@Body() dto: CreateProductDto) {
    // ...
  }
  
  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard, ProductOwnerGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 متغير في الدقيقة
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto
  ) {
    // ...
  }
}
```

### 6. تنظيف HTML و XSS Prevention

```typescript
// sanitize.interceptor.ts
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }
    
    return next.handle();
  }
  
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  }
}
```

### 7. SQL Injection Prevention

```typescript
// Prisma يحمي تلقائياً من SQL Injection
// لكن يجب الحذر عند استخدام raw queries

// ❌ خطأ - عرضة للحقن
const products = await prisma.$queryRaw`
  SELECT * FROM products WHERE name = ${userInput}
`;

// ✅ صحيح - باستخدام Prisma
const products = await prisma.product.findMany({
  where: {
    name: {
      contains: userInput,
      mode: 'insensitive',
    },
  },
});

// ✅ صحيح - raw query آمن
const products = await prisma.$queryRaw`
  SELECT * FROM products WHERE name = ${Prisma.sql`${userInput}`}
`;
```

### 8. تسجيل الأحداث (Audit Logging)

```typescript
// audit.service.ts
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}
  
  async log(event: {
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entityType: 'product' | 'variant' | 'attribute';
    entityId: string;
    userId: string;
    oldData?: any;
    newData?: any;
    ip?: string;
  }) {
    await this.prisma.audit_logs.create({
      data: {
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        userId: event.userId,
        oldData: event.oldData ? JSON.stringify(event.oldData) : null,
        newData: event.newData ? JSON.stringify(event.newData) : null,
        ipAddress: event.ip,
        createdAt: new Date(),
      },
    });
  }
}

// استخدام
@Injectable()
export class ProductVariantsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}
  
  async updateVariant(variantId: string, userId: string, dto: UpdateVariantDto, ip: string) {
    const oldVariant = await this.prisma.product_variants.findUnique({
      where: { id: variantId },
    });
    
    const updated = await this.prisma.product_variants.update({
      where: { id: variantId },
      data: dto,
    });
    
    await this.auditService.log({
      action: 'UPDATE',
      entityType: 'variant',
      entityId: variantId,
      userId,
      oldData: oldVariant,
      newData: updated,
      ip,
    });
    
    return updated;
  }
}
```

---

## 🎨 واجهة المستخدم (UI Components)

### صفحة إضافة منتج (ملابس):
```
┌─────────────────────────────────────────────────┐
│  📦 إضافة منتج جديد                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ── الخطوة 1: المعلومات الأساسية ──              │
│  [اسم المنتج: قميص رجالي قطن        ]           │
│  [الوصف: ...................... ]              │
│  [السعر الأساسي: 25,000 د.ع        ]           │
│  [الصور: 📷 📷 📷                   ]           │
│                                                 │
│  ── الخطوة 2: الخصائص ──                        │
│  الجنس: ○ رجالي  ○ نسائي  ○ أطفال              │
│  الخامة: [قطن 100%                ]            │
│                                                 │
│  ── الخطوة 3: المتغيرات ──                      │
│  ┌─────────────────────────────────────────┐   │
│  │ المقاسات: [✓]S [✓]M [✓]L [✓]XL [ ]XXL  │   │
│  │ الألوان:  [🔴أحمر] [🔵أزرق] [➕إضافة]   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ── الخطوة 4: المخزون ──                        │
│  ┌──────────┬────────┬─────────┬─────────┐    │
│  │ المتغير  │ الكمية │ السعر   │ SKU     │    │
│  ├──────────┼────────┼─────────┼─────────┤    │
│  │ أحمر - S │ [10]   │ [-]     │ SH-R-S  │    │
│  │ أحمر - M │ [15]   │ [-]     │ SH-R-M  │    │
│  │ أزرق - S │ [8]    │ [-]     │ SH-B-S  │    │
│  └──────────┴────────┴─────────┴─────────┘    │
│                                                 │
│         [إلغاء]  [💾 حفظ المنتج]                │
└─────────────────────────────────────────────────┘
```

### صفحة إضافة منتج (كتب):
```
┌─────────────────────────────────────────────────┐
│  📚 إضافة كتاب جديد                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ── المعلومات الأساسية ──                       │
│  [اسم الكتاب: تعلم البرمجة          ]           │
│  [السعر: 15,000 د.ع               ]            │
│                                                 │
│  ── طريقة التسليم * ──                          │
│  ◉ PDF إلكتروني                                 │
│  ○ نسخة ورقية                                   │
│  ○ إلكتروني + ورقي                              │
│                                                 │
│  ── اللغة * ──                                  │
│  ◉ العربية  ○ الإنجليزية  ○ الكردية            │
│                                                 │
│  ── معلومات إضافية ──                           │
│  [المؤلف: محمد أحمد             ]              │
│  [عدد الصفحات: 250              ]              │
│  [ISBN: 978-3-16-148410-0       ]              │
│                                                 │
│         [إلغاء]  [💾 حفظ المنتج]                │
└─────────────────────────────────────────────────┘
```

---

## 📁 هيكل الملفات

```
apps/api/
├── prisma/
│   ├── schema.prisma                    ← تحديث
│   └── seed.ts                          ← تحديث
│
└── src/domain/stores/
    ├── dto/
    │   ├── create-product-variant.dto.ts    ← جديد
    │   ├── update-product-variant.dto.ts    ← جديد
    │   └── product-attribute.dto.ts         ← جديد
    │
    ├── services/
    │   ├── product-variants.service.ts      ← جديد
    │   ├── product-attributes.service.ts    ← جديد
    │   └── template-validator.service.ts    ← جديد
    │
    ├── controllers/
    │   └── product-variants.controller.ts   ← جديد
    │
    ├── guards/
    │   └── product-owner.guard.ts           ← جديد
    │
    └── products.service.ts                  ← تحديث

apps/web/
├── hooks/
│   └── useStore.ts                          ← تحديث
│
└── components/(UserDashboard)/store/
    └── products/
        ├── CreateProductForm.tsx            ← تحديث/جديد
        ├── DynamicAttributeField.tsx        ← جديد
        ├── VariantManager.tsx               ← جديد
        ├── VariantStockTable.tsx            ← جديد
        ├── ColorPicker.tsx                  ← جديد
        └── SizeSelector.tsx                 ← جديد
```

---

## 📋 خطوات التنفيذ

| # | المهمة | الأولوية | الوقت |
|---|--------|---------|-------|
| 1 | تحديث schema.prisma | 🔴 عالي | 15 دقيقة |
| 2 | تحديث seed.ts بـ templateFields | 🔴 عالي | 25 دقيقة |
| 3 | إنشاء DTOs | 🔴 عالي | 15 دقيقة |
| 4 | إنشاء Template Validator | 🔴 عالي | 20 دقيقة |
| 5 | إنشاء Product Variants Service | 🔴 عالي | 30 دقيقة |
| 6 | إنشاء Product Attributes Service | 🔴 عالي | 20 دقيقة |
| 7 | تحديث Products Service | 🟡 متوسط | 25 دقيقة |
| 8 | إنشاء Controllers | 🔴 عالي | 20 دقيقة |
| 9 | إنشاء Guards | 🟡 متوسط | 15 دقيقة |
| 10 | تحديث useStore hook | 🔴 عالي | 20 دقيقة |
| 11 | إنشاء DynamicAttributeField | 🔴 عالي | 30 دقيقة |
| 12 | إنشاء VariantManager | 🔴 عالي | 35 دقيقة |
| 13 | إنشاء ColorPicker & SizeSelector | 🟡 متوسط | 25 دقيقة |
| 14 | تحديث CreateProductForm | 🔴 عالي | 40 دقيقة |
| 15 | اختبار النظام | 🟡 متوسط | 30 دقيقة |

**المجموع: ~6 ساعات**

---

## ✅ قائمة التحقق الأمني

- [ ] التحقق من صحة جميع المدخلات (Validation)
- [ ] تنظيف HTML من جميع النصوص (Sanitization)
- [ ] تشفير البيانات الحساسة (Encryption)
- [ ] التحقق من ملكية المنتج قبل التعديل (Authorization)
- [ ] تطبيق Rate Limiting على الـ APIs
- [ ] تسجيل جميع العمليات الحساسة (Audit Logging)
- [ ] حماية من SQL Injection (باستخدام Prisma)
- [ ] حماية من XSS (Sanitize Interceptor)
- [ ] التحقق من صلاحية الـ JWT
- [ ] تشفير الاتصال (HTTPS)
