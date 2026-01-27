# المرحلة الثالثة: إدارة المتاجر والمنتجات
# Phase 3: Store & Product Management

## نظرة عامة | Overview
هذه المرحلة تركز على بناء نظام المتاجر الإلكترونية الكامل، إدارة المنتجات، معرض الصور، والبحث.

**المدة المتوقعة:** 3-4 أسابيع  
**الأولوية:** عالية  
**الحالة:** 🔵 في الانتظار (بعد المرحلة 2)

---

## المتطلبات الأساسية | Prerequisites

- ✅ إتمام المرحلة الثانية بنجاح
- ✅ نظام الملفات الشخصية يعمل
- ✅ نظام رفع الصور جاهز
- ✅ نظام المصادقة والتفويض جاهز

---

## الأهداف الرئيسية | Main Objectives

### 1. إدارة المتاجر
- ✅ إنشاء متجر إلكتروني
- ✅ تخصيص تصميم المتجر
- ✅ رفع شعار وبانر المتجر
- ✅ إعدادات المتجر (معلومات الاتصال)
- ✅ تفعيل/تعطيل المتجر

### 2. إدارة المنتجات
- ✅ إضافة منتجات جديدة
- ✅ تعديل وحذف المنتجات
- ✅ إدارة معرض صور المنتج
- ✅ إدارة المخزون
- ✅ أسعار البيع والتخفيضات
- ✅ حالات المنتج (متوفر/غير متوفر)

### 3. واجهة المتجر
- ✅ صفحة المتجر العامة
- ✅ عرض المنتجات بشكل جذاب
- ✅ صفحة تفاصيل المنتج
- ✅ معرض صور تفاعلي
- ✅ نظام البحث والفلترة

### 4. تحسينات الأداء
- ✅ تخزين مؤقت للمنتجات
- ✅ تحسين الصور
- ✅ Pagination للمنتجات
- ✅ Lazy loading للصور

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 3.1: Backend - Store Module

#### 1. Store DTOs

**apps/api/src/stores/dto/create-store.dto.ts:**
```typescript
import { IsString, IsOptional, IsEmail, IsPhoneNumber, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'My Awesome Store' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'my-awesome-store' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'Best products in town' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'store@example.com' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsPhoneNumber()
  @IsOptional()
  contactPhone?: string;
}
```

#### 2. Store Service

**apps/api/src/stores/stores.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { StoreStatus } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createStoreDto: CreateStoreDto) {
    // Check if slug exists
    const existingStore = await this.prisma.store.findUnique({
      where: { slug: createStoreDto.slug },
    });

    if (existingStore) {
      throw new ConflictException('Store slug already taken');
    }

    return this.prisma.store.create({
      data: {
        ...createStoreDto,
        userId,
        status: StoreStatus.ACTIVE,
      },
      include: {
        products: {
          take: 10,
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        products: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async findByUser(userId: string) {
    return this.prisma.store.findMany({
      where: { userId },
      include: {
        products: {
          take: 5,
        },
      },
    });
  }

  async update(userId: string, storeId: string, updateStoreDto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this store');
    }

    // Check slug uniqueness if updating slug
    if (updateStoreDto.slug && updateStoreDto.slug !== store.slug) {
      const existingStore = await this.prisma.store.findUnique({
        where: { slug: updateStoreDto.slug },
      });

      if (existingStore) {
        throw new ConflictException('Store slug already taken');
      }
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: updateStoreDto,
    });
  }

  async updateStatus(userId: string, storeId: string, status: StoreStatus) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this store');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: { status },
    });
  }

  async delete(userId: string, storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this store');
    }

    return this.prisma.store.delete({
      where: { id: storeId },
    });
  }
}
```

---

### المرحلة 3.2: Backend - Product Module

#### 1. Product DTOs

**apps/api/src/products/dto/create-product.dto.ts:**
```typescript
import { IsString, IsOptional, IsNumber, IsInt, Min, Max, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Amazing Product' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'amazing-product' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({ example: 'This is an amazing product' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 79.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  salePrice?: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}
```

#### 2. Product Service

**apps/api/src/products/products.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, storeId: string, createProductDto: CreateProductDto) {
    // Verify store ownership
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.userId !== userId) {
      throw new ForbiddenException('Not authorized to add products to this store');
    }

    // Check slug uniqueness
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existingProduct) {
      throw new ConflictException('Product slug already taken');
    }

    // Determine status based on quantity
    const status = createProductDto.quantity > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK;

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        storeId,
        status,
      },
      include: {
        images: true,
      },
    });
  }

  async findByStore(storeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { storeId },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: { storeId } }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(userId: string, productId: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.store.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this product');
    }

    // Check slug uniqueness if updating
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug: updateProductDto.slug },
      });

      if (existingProduct) {
        throw new ConflictException('Product slug already taken');
      }
    }

    // Update status based on quantity
    if (updateProductDto.quantity !== undefined) {
      updateProductDto.status = updateProductDto.quantity > 0 
        ? ProductStatus.ACTIVE 
        : ProductStatus.OUT_OF_STOCK;
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: updateProductDto,
      include: {
        images: true,
      },
    });
  }

  async delete(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.store.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this product');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async search(storeId: string, query: string) {
    return this.prisma.product.findMany({
      where: {
        storeId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        status: ProductStatus.ACTIVE,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      take: 20,
    });
  }
}
```

---

### المرحلة 3.3: Frontend - Store Management

#### 1. صفحة إنشاء متجر

**apps/web/src/app/dashboard/stores/create/page.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createStore } from '@/lib/api/stores';

const storeSchema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters').max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function CreateStorePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    form.setValue('slug', slug);
  };

  const onSubmit = async (data: StoreFormData) => {
    setIsLoading(true);
    try {
      const store = await createStore(data);
      router.push(`/dashboard/stores/${store.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create store');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Store</CardTitle>
          <CardDescription>
            Set up your online store to start selling products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Awesome Store"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">rukny.io/store/</span>
                        <Input placeholder="my-awesome-store" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your store..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="store@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Store...' : 'Create Store'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. صفحة المتجر العامة

**apps/web/src/app/store/[slug]/page.tsx:**
```typescript
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getStoreBySlug } from '@/lib/api/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';

export default async function StorePage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Store Logo */}
            {store.logo && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                <Image src={store.logo} alt={store.name} fill className="object-cover" />
              </div>
            )}

            {/* Store Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mb-4">{store.description}</p>
              )}

              <div className="flex gap-4 text-sm text-gray-500">
                {store.contactEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${store.contactEmail}`} className="hover:text-blue-600">
                      {store.contactEmail}
                    </a>
                  </div>
                )}
                {store.contactPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${store.contactPhone}`} className="hover:text-blue-600">
                      {store.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Products</h2>

        {store.products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No products available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {store.products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${store.slug}/product/${product.slug}`}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].imagePath}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {product.status === 'OUT_OF_STOCK' && (
                      <Badge className="absolute top-2 right-2" variant="destructive">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.salePrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق
- [ ] Store CRUD APIs جاهزة
- [ ] Product CRUD APIs جاهزة
- [ ] Product Images management
- [ ] صفحة إنشاء متجر
- [ ] صفحة المتجر العامة
- [ ] صفحة تفاصيل المنتج
- [ ] لوحة تحكم المنتجات
- [ ] نظام البحث
- [ ] إدارة المخزون
- [ ] اختبارات شاملة

### 📊 الميزات المنجزة
```
✅ إنشاء متجر
✅ تخصيص المتجر
✅ إضافة منتجات
✅ معرض صور المنتجات
✅ إدارة المخزون
✅ أسعار وتخفيضات
✅ صفحة متجر عامة
✅ صفحة المنتج
✅ البحث والفلترة
```

---

## الخطوة التالية | Next Steps

بعد إتمام المرحلة الثالثة بنجاح، انتقل إلى:
📄 **المرحلة الرابعة:** `PHASE_04_EVENTS_MANAGEMENT.md`

---

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**الحالة:** 🔵 جاهز للتنفيذ بعد المرحلة 2
