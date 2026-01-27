# 🚀 أمثلة عملية - تحسينات سرعة التحميل

> كود جاهز للتطبيق الفوري

---

## 1. إعداد React Query

### خطوة 1: تثبيت المكتبات
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### خطوة 2: إنشاء Query Client

**ملف: `lib/query-client.ts`**

```typescript
'use client';

import {
  QueryClient,
  DefaultError,
  QueryClientConfig,
} from '@tanstack/react-query';

const queryConfig = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 دقائق
    gcTime: 1000 * 60 * 10, // 10 دقائق
    retry: 1,
    refetchOnWindowFocus: false,
  },
} satisfies QueryClientConfig;

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
```

### خطوة 3: إنشاء Provider

**ملف: `lib/providers.tsx`**

```typescript
'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './query-client';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### خطوة 4: تطبيق على الـ Layout

**ملف: `app/layout.tsx`**

```typescript
import { Providers } from '@/lib/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 2. تحسين HeaderNav - مثال عملي

**ملف: `components/HeaderNav-Optimized.tsx`**

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/lib/auth/auth-provider';
import { useAuth } from '@/hooks/useAuth';

// ✅ 1. استخراج الثوابت
const NAV_ITEMS = [
  { id: 'app' as const, label: 'التطبيق', labelEn: 'App', href: '/app' },
  { id: 'task' as const, label: 'المهام', labelEn: 'Task', href: '/app/tasks' },
  { id: 'archive' as const, label: 'الأرشيف', labelEn: 'Archive', href: '/app/archive' },
];

const MOTION_CONFIG = {
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
};

// ✅ 2. استخراج مكون فرعي مع React.memo
const NavButton = memo(function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={isActive ? 'active' : 'inactive'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {item.labelEn}
    </motion.button>
  );
});

export function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { unreadCount } = useNotifications();

  // ✅ 3. استخدام useCallback للدوال
  const handleNavClick = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // ✅ 4. استخدام useMemo للمشتقات المحسوبة
  const activeNav = useMemo(() => {
    return NAV_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    );
  }, [pathname]);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* البحث */}
        <motion.button
          onClick={openSearch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔍
        </motion.button>

        {/* التنقل */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeNav?.id === item.id}
              onClick={() => handleNavClick(item.href)}
            />
          ))}
        </div>

        {/* الإشعارات */}
        <motion.button
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}
```

---

## 3. Hooks محسّن - useProducts

**ملف: `hooks/useProducts-Optimized.ts`**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  status: 'active' | 'inactive' | 'draft';
}

interface ProductsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

const QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (params: ProductsParams) => [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
};

// ✅ استخدام useQuery مع caching
export function useProducts(params: ProductsParams = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    search,
  } = params;

  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('limit', String(limit));
      if (status) searchParams.set('status', status);
      if (search) searchParams.set('search', search);

      const response = await fetch(
        `/api/products?${searchParams.toString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 دقائق
    gcTime: 1000 * 60 * 10, // 10 دقائق - تحتفظ بالبيانات حتى بعد عدم الاستخدام
  });
}

// ✅ استخدام useQuery للمنتج الواحد
export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!id, // لا تطلب البيانات إذا لم يكن هناك ID
    staleTime: 1000 * 60 * 5,
  });
}

// ✅ استخدام useMutation لإضافة منتج
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: (newProduct) => {
      // ✅ تحديث الـ cache فوراً بدون إعادة fetch
      queryClient.setQueryData(
        QUERY_KEYS.detail(newProduct.id),
        newProduct
      );
      // ✅ إبطال الـ list queries لإعادة تحميل البيانات
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      });
    },
  });
}

// ✅ استخدام useMutation لتحديث منتج
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: (updatedProduct, { id }) => {
      queryClient.setQueryData(
        QUERY_KEYS.detail(id),
        updatedProduct
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      });
    },
  });
}

// ✅ استخدام useMutation لحذف منتج
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      });
    },
  });
}
```

### استخدام الـ Hook:

```typescript
'use client';

import { useProducts, useCreateProduct } from '@/hooks/useProducts-Optimized';
import { useState } from 'react';

export function ProductsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // ✅ البيانات مُخزنة وتُحدّث تلقائياً
  const { data, isLoading, error } = useProducts({
    page,
    limit: 20,
    search,
  });

  const createProduct = useCreateProduct();

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="ابحث عن منتج..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // إعادة تعيين الصفحة
        }}
      />

      <div>
        {data?.products.map((product) => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>

      <button
        onClick={() => createProduct.mutate({ name: 'منتج جديد' })}
        disabled={createProduct.isPending}
      >
        {createProduct.isPending ? 'جاري الإضافة...' : 'إضافة منتج'}
      </button>
    </div>
  );
}
```

---

## 4. Dynamic Imports - مثال

**ملف: `app/store/page.tsx`**

```typescript
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ تحميل ديناميكي للمكونات الكبيرة
const StoreStats = dynamic(
  () => import('@/components/store/StoreStats').then(mod => ({ default: mod.StoreStats })),
  {
    loading: () => <div className="h-40 bg-gray-200 animate-pulse rounded" />,
  }
);

const ProductsFiltersBar = dynamic(
  () => import('@/components/store/ProductsFiltersBar'),
  {
    loading: () => <div className="h-12 bg-gray-200 animate-pulse rounded" />,
  }
);

const ProductsList = dynamic(
  () => import('@/components/store/ProductsList'),
  {
    loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded" />,
  }
);

export default function StorePage() {
  return (
    <div className="space-y-6">
      {/* ✅ تحميل فوري (critical) */}
      <h1>متجري</h1>

      {/* ✅ تحميل ديناميكي (non-critical) */}
      <Suspense fallback={<div className="h-40 bg-gray-200 animate-pulse rounded" />}>
        <StoreStats />
      </Suspense>

      <Suspense fallback={<div className="h-12 bg-gray-200 animate-pulse rounded" />}>
        <ProductsFiltersBar />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded" />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}
```

---

## 5. Zustand State Management

**ملف: `store/ui.store.ts`**

```typescript
'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  activeSection: string;
  searchOpen: boolean;
  notificationsOpen: boolean;

  // الدوال
  toggleSidebar: () => void;
  setActiveSection: (section: string) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    isSidebarOpen: true,
    activeSection: 'home',
    searchOpen: false,
    notificationsOpen: false,

    toggleSidebar: () =>
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setActiveSection: (section) =>
      set({ activeSection: section }),

    setSearchOpen: (open) =>
      set({ searchOpen: open }),

    setNotificationsOpen: (open) =>
      set({ notificationsOpen: open }),
  }))
);
```

### استخدام الـ Store:

```typescript
import { useUIStore } from '@/store/ui.store';

export function Header() {
  const { isSidebarOpen, toggleSidebar, activeSection } = useUIStore();

  return (
    <header>
      <button onClick={toggleSidebar}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      <p>القسم الحالي: {activeSection}</p>
    </header>
  );
}
```

---

## 6. Advanced Caching Headers

**ملف: `app/api/products/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');

  const skip = (page - 1) * limit;

  // ✅ بناء الـ where clause
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // ✅ الحصول على البيانات مع pagination
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  // ✅ إضافة caching headers
  const response = NextResponse.json({
    products,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });

  // ✅ caching strategy:
  // - s-maxage: cache على الـ CDN لمدة ساعة
  // - stale-while-revalidate: تقديم بيانات قديمة لمدة يوم
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );

  return response;
}
```

---

## 7. Image Optimization

**ملف: `lib/image-optimizer.ts`**

```typescript
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

interface OptimizeImageOptions {
  inputPath: string;
  outputDir: string;
  maxWidth?: number;
  maxHeight?: number;
}

export async function optimizeProductImage({
  inputPath,
  outputDir,
  maxWidth = 1200,
  maxHeight = 1200,
}: OptimizeImageOptions) {
  try {
    const buffer = await fs.readFile(inputPath);
    const filename = path.parse(inputPath).name;

    // ✅ تحديد حجم الصورة
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width || maxWidth;
    const height = metadata.height || maxHeight;

    // ✅ التحسينات
    const optimizations = [
      // WebP - أفضل ضغط
      {
        format: 'webp',
        quality: 80,
        file: `${filename}.webp`,
      },
      // AVIF - أحدث وأصغر
      {
        format: 'avif',
        quality: 75,
        file: `${filename}.avif`,
      },
      // JPEG - للتوافقية
      {
        format: 'jpeg',
        quality: 85,
        file: `${filename}.jpg`,
      },
      // Thumbnail
      {
        format: 'webp',
        quality: 80,
        width: 300,
        height: 300,
        file: `${filename}-thumb.webp`,
      },
    ];

    // ✅ معالجة الصور
    for (const opt of optimizations) {
      let pipeline = image.clone();

      if (opt.width && opt.height) {
        pipeline = pipeline.resize(opt.width, opt.height, {
          fit: 'cover',
          position: 'center',
        });
      }

      if (opt.format === 'webp') {
        pipeline = pipeline.webp({ quality: opt.quality });
      } else if (opt.format === 'avif') {
        pipeline = pipeline.avif({ quality: opt.quality });
      } else if (opt.format === 'jpeg') {
        pipeline = pipeline.jpeg({
          quality: opt.quality,
          progressive: true,
        });
      }

      const outputPath = path.join(outputDir, opt.file);
      await pipeline.toFile(outputPath);
    }

    return {
      success: true,
      files: optimizations.map(opt => opt.file),
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
}
```

---

## 8. Service Worker (PWA)

**ملف: `public/service-worker.js`**

```javascript
const CACHE_NAME = 'rukny-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/styles/global.css',
];

// ✅ تثبيت الـ Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ✅ تنشيط الـ Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ✅ استراتيجية Cache-First للأصول الثابتة
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // ✅ للـ API - Network-First
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // ✅ للـ Assets - Cache-First
  event.respondWith(cacheFirst(event.request));
});

// ✅ Cache-First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// ✅ Network-First Strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
```

**تسجيل الـ Service Worker في المتصفح:**

```typescript
// lib/register-sw.ts
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

---

## ✅ قائمة التحقق من التطبيق

- [ ] تثبيت React Query وتكوينه
- [ ] تطبيق QueryClientProvider على الـ layout
- [ ] تحسين HeaderNav مع useCallback و useMemo
- [ ] إنشاء hooks محسّنة مع React Query
- [ ] تطبيق dynamic imports على المكونات الكبيرة
- [ ] إضافة Zustand للـ state management
- [ ] تحسين API endpoints مع pagination
- [ ] إضافة caching headers
- [ ] تحسين الصور باستخدام sharp
- [ ] تسجيل Service Worker

