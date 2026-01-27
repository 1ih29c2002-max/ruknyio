# Product Detail Modal V2 - نظام عرض تفاصيل المنتج الجديد

## نظرة عامة
تصميم مودال متطور لعرض تفاصيل المنتج بطريقة احترافية مستوحاة من أفضل ممارسات التجارة الإلكترونية.

## المميزات الرئيسية

### 1. تصميم Grid Layout
- **الحاسوب**: تصميم جانبي - صورة على اليمين، معلومات على اليسار
- **الهاتف**: تصميم عمودي - الصورة في الأعلى، المعلومات في الأسفل

### 2. معرض الصور
- صورة رئيسية كبيرة
- صور مصغرة أسفل الصورة الرئيسية
- انتقالات سلسة بين الصور
- تأثيرات Hover على الصور المصغرة

### 3. معلومات المنتج
- عنوان المتجر مع شارة التحقق الزرقاء
- اسم المنتج وفئته (Collection)
- السعر بتنسيق IQD
- رسالة الشحن
- اختيار اللون مع معاينة فورية
- قائمة العملات (IQD, USD)
- زر المشاركة

### 4. الوصف القابل للطي
- Accordion للوصف التفصيلي
- رموز توضيحية
- تأثير انزلاق سلس

### 5. Cart Bar - الميزة الأساسية
عند الضغط على "Add To Cart" يظهر شريط في أسفل الشاشة يحتوي على:

- **محدد الكمية**: أزرار + و - لتعديل الكمية
- **معلومات السلة**: 
  - أيقونة السلة مع عداد الكمية
  - "Total Amount" مع السعر الإجمالي
- **زر View Cart**: زر أخضر للانتقال للسلة
- **خلفية سوداء متدرجة**: تصميم جذاب مع تأثير blur

### 6. تجربة مستخدم محسّنة
- تأثيرات حركية سلسة (Framer Motion)
- استجابة كاملة للشاشات المختلفة
- تصميم نظيف وعصري
- ألوان متناسقة

## كيفية الاستخدام

### 1. استيراد المودال
\`\`\`typescript
import { ProductDetailModalV2 } from '@/components/checkout';
\`\`\`

### 2. تعريف الـ State
\`\`\`typescript
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
\`\`\`

### 3. استخدام المودال
\`\`\`typescript
<ProductDetailModalV2
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  product={selectedProduct}
  themeColor="#10b981"
  onAddToCart={(product, quantity) => {
    console.log('Added to cart:', product, quantity);
    // أضف منطق إضافة المنتج للسلة هنا
  }}
  onBuyNow={(product, quantity) => {
    console.log('Buy now:', product, quantity);
    // أضف منطق الشراء الفوري هنا
  }}
/>
\`\`\`

### 4. فتح المودال عند الضغط على منتج
\`\`\`typescript
<button 
  onClick={() => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }}
>
  عرض التفاصيل
</button>
\`\`\`

## تخصيص الألوان

يمكنك تمرير ألوان مخصصة للمنتج:

\`\`\`typescript
const product = {
  id: '1',
  name: 'قنينة سوائل هلا 750 مل',
  description: 'مصنوعة من ستانلس ستيل مزدوج...',
  price: 24000,
  currency: 'IQD',
  category: { name: 'Bottles' },
  images: [
    '/images/bottle-blue.jpg',
    '/images/bottle-gray.jpg',
    '/images/bottle-yellow.jpg',
  ],
  colors: [
    { name: 'ليل', value: '#1e3a5f' },
    { name: 'ذهبي', value: '#d4af37' },
    { name: 'رمادي', value: '#7c8d9a' },
    { name: 'أخضر', value: '#5a7d6f' },
    { name: 'أحمر', value: '#8b3a3a' },
    { name: 'أسود', value: '#2b2b2b' },
    { name: 'تركواز', value: '#006d6f' },
    { name: 'برتقالي', value: '#e88b00' },
    { name: 'رمادي فاتح', value: '#c4c4c4' },
  ],
  stock: 50,
};
\`\`\`

## مثال كامل

\`\`\`typescript
'use client';

import { useState } from 'react';
import { ProductDetailModalV2 } from '@/components/checkout';

export default function ProductPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const product = {
    id: '1',
    name: 'قنينة سوائل هلا 750 مل',
    description: 'مصنوعة من ستانلس ستيل مزدوج (304) مقاوم للصدأ. يحافظ على برودة مشروباتك حتى 24 ساعة. غطاء آمن حال من تفكيحين: للشرب. مناسبة للخرجات العائلية والسفر.',
    price: 24000,
    currency: 'IQD',
    category: { name: 'Bottles' },
    images: [
      '/images/bottle-blue.jpg',
      '/images/bottle-gray.jpg',
    ],
    colors: [
      { name: 'ليل', value: '#1e3a5f' },
      { name: 'ذهبي', value: '#d4af37' },
      { name: 'رمادي', value: '#7c8d9a' },
    ],
    stock: 50,
  };

  const handleAddToCart = (product: any, quantity: number) => {
    console.log('تمت إضافة', quantity, 'من', product.name, 'للسلة');
    // أضف المنتج للسلة في الـ state أو API
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        عرض تفاصيل المنتج
      </button>

      <ProductDetailModalV2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        themeColor="#10b981"
        onAddToCart={handleAddToCart}
        onBuyNow={(product, quantity) => {
          console.log('شراء فوري:', product, quantity);
        }}
      />
    </div>
  );
}
\`\`\`

## الفرق بين V1 و V2

| الميزة | V1 | V2 |
|--------|----|----|
| التصميم | عمودي فقط | Grid Layout (جانبي/عمودي) |
| الصور | صورة واحدة كبيرة | صورة رئيسية + مصغرات |
| Cart Bar | لا يوجد | يظهر عند الإضافة للسلة |
| محدد الكمية | في الأسفل | مدمج في Cart Bar |
| اختيار اللون | غير موجود | دوائر ملونة قابلة للنقر |
| الوصف | ثابت | Accordion قابل للطي |
| Header | أزرار فقط | اسم المتجر + شارة التحقق |

## ملاحظات التصميم

1. **الاستجابة**: التصميم يتكيف تلقائياً مع حجم الشاشة
2. **الحركات**: استخدام Framer Motion للحركات السلسة
3. **الألوان**: نظام ألوان متناسق (أسود، رمادي، أخضر، أبيض)
4. **الأيقونات**: من Lucide React
5. **التدرجات**: خلفيات متدرجة للعناصر المهمة

## متطلبات التثبيت

\`\`\`bash
npm install framer-motion lucide-react
\`\`\`

## التوافق
- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ أجهزة اللمس والتحريك
- ✅ Responsive Design

## License
MIT
