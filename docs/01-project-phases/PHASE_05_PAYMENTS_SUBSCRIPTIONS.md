# المرحلة الخامسة: الدفع والاشتراكات
# Phase 5: Payments & Subscriptions

## نظرة عامة | Overview
هذه المرحلة تركز على تكامل نظام الدفع، إدارة الاشتراكات، والخطط المدفوعة.

**المدة المتوقعة:** 3-4 أسابيع  
**الأولوية:** عالية جداً  
**الحالة:** 🔵 في الانتظار (بعد المرحلة 4)

---

## الأهداف الرئيسية | Main Objectives

### 1. تكامل Stripe
- ✅ إعداد Stripe API
- ✅ معالجة المدفوعات
- ✅ Webhooks للتأكيد
- ✅ إدارة طرق الدفع

### 2. نظام الاشتراكات
- ✅ خطط الاشتراك (شهري/سنوي)
- ✅ تجديد تلقائي
- ✅ إلغاء الاشتراكات
- ✅ ترقية/تخفيض الخطة

### 3. إدارة الخطط
- ✅ خطط مختلفة (Basic/Premium/Pro)
- ✅ ميزات كل خطة
- ✅ حدود الاستخدام
- ✅ التحكم بالوصول

### 4. الفواتير والإيصالات
- ✅ إنشاء فواتير تلقائية
- ✅ إرسال إيصالات بالبريد
- ✅ تاريخ المدفوعات
- ✅ تصدير الفواتير

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 5.1: إعداد Stripe

#### 1. تثبيت المكتبات

```bash
# Backend
cd apps/api
npm install stripe

# Frontend
cd apps/web
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 2. تكوين Stripe

**apps/api/.env:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 3. Stripe Module

**apps/api/src/stripe/stripe.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('STRIPE_SECRET_KEY'), {
          apiVersion: '2023-10-16',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [StripeService],
})
export class StripeModule {}
```

---

### المرحلة 5.2: Backend - Plans & Subscriptions

#### 1. تحديث Prisma Schema

```prisma
model Plan {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  billingCycle BillingCycle
  features    Json
  isActive    Boolean  @default(true)
  stripePriceId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  subscriptions Subscription[]
  
  @@map("plans")
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

model Subscription {
  id              String   @id @default(uuid())
  userId          String
  planId          String
  status          SubscriptionStatus @default(ACTIVE)
  startDate       DateTime @default(now())
  endDate         DateTime?
  stripeSubscriptionId String? @unique
  stripeCustomerId     String?
  paymentMethod   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan            Plan     @relation(fields: [planId], references: [id])
  payments        Payment[]
  
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
}

model Payment {
  id              String   @id @default(uuid())
  subscriptionId  String
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("usd")
  status          PaymentStatus @default(PENDING)
  stripePaymentIntentId String? @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  subscription    Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

// تحديث User model
model User {
  // ... الحقول الموجودة
  subscriptions Subscription[]
  stripeCustomerId String? @unique
}
```

#### 2. Plans Service

**apps/api/src/plans/plans.service.ts:**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: createPlanDto,
    });
  }

  async findAll(activeOnly = true) {
    return this.prisma.plan.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
```

#### 3. Subscriptions Service

**apps/api/src/subscriptions/subscriptions.service.ts:**
```typescript
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    @Inject('STRIPE') private stripe: Stripe,
  ) {}

  async create(userId: string, planId: string, paymentMethodId: string) {
    // Get plan
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    // Get or create Stripe customer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId },
      });
      customerId = customer.id;

      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Attach payment method
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save to database
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    return {
      subscription,
      clientSecret: (stripeSubscription.latest_invoice as any).payment_intent.client_secret,
    };
  }

  async findByUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActive(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });
  }

  async cancel(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update in database
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED' },
    });
  }

  async changePlan(userId: string, subscriptionId: string, newPlanId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    const newPlan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    // Update in Stripe
    if (subscription.stripeSubscriptionId) {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPlan.stripePriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
    }

    // Update in database
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { planId: newPlanId },
      include: { plan: true },
    });
  }
}
```

#### 4. Stripe Webhooks

**apps/api/src/stripe/stripe.controller.ts:**
```typescript
import { Controller, Post, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.stripeService.handleWebhook(signature, request.rawBody);
  }
}
```

**apps/api/src/stripe/stripe.service.ts:**
```typescript
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE') private stripe: Stripe,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (subscription) {
      // Create payment record
      await this.prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency,
          status: 'SUCCEEDED',
          stripePaymentIntentId: invoice.payment_intent as string,
        },
      });

      // Update subscription status
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' },
      });
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      });
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        status: 'CANCELLED',
        endDate: new Date(stripeSubscription.canceled_at * 1000),
      },
    });
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    // Handle subscription updates if needed
    console.log('Subscription updated:', stripeSubscription.id);
  }
}
```

---

### المرحلة 5.3: Frontend - Subscription Pages

#### 1. صفحة الخطط

**apps/web/src/app/pricing/page.tsx:**
```typescript
import Link from 'next/link';
import { Check } from 'lucide-react';
import { getPlans } from '@/lib/api/plans';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card
            key={plan.id}
            className={`relative ${
              index === 1 ? 'border-blue-500 border-2 shadow-xl scale-105' : ''
            }`}
          >
            {index === 1 && (
              <Badge className="absolute top-4 right-4">Most Popular</Badge>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-600">
                  /{plan.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {(plan.features as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="w-full" variant={index === 1 ? 'default' : 'outline'}>
                <Link href={`/subscribe/${plan.id}`}>
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 2. صفحة الاشتراك

**apps/web/src/app/subscribe/[planId]/page.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribe } from '@/lib/api/subscriptions';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ plan }: { plan: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement!,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Subscribe
      const { clientSecret } = await subscribe(plan.id, paymentMethod!.id);

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Success
      router.push('/dashboard/subscription?success=true');
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : `Subscribe for $${plan.price}/${plan.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}`}
      </Button>
    </form>
  );
}

export default function SubscribePage({ plan }: { plan: any }) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Subscribe to {plan.name}
          </CardTitle>
          <p className="text-gray-600">{plan.description}</p>
        </CardHeader>

        <CardContent>
          <Elements stripe={stripePromise}>
            <CheckoutForm plan={plan} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق
- [ ] Stripe integration
- [ ] Plans management
- [ ] Subscription system
- [ ] Payment processing
- [ ] Webhook handlers
- [ ] صفحة الخطط
- [ ] صفحة الاشتراك
- [ ] لوحة تحكم الاشتراكات
- [ ] إدارة طرق الدفع
- [ ] الفواتير والإيصالات

---

## الخطوة التالية | Next Steps

📄 **المرحلة السادسة:** `PHASE_06_ANALYTICS_MONITORING.md`

---

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**الحالة:** 🔵 جاهز للتنفيذ بعد المرحلة 4
