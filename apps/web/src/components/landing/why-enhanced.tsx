"use client";

import { 
  Zap, 
  Globe, 
  Users, 
  Shield,
  CheckCircle
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "سريع وسهل",
    description: "ابدأ في أقل من 3 دقائق"
  },
  {
    icon: Globe,
    title: "وصول عالمي",
    description: "99.9% وقت التشغيل"
  },
  {
    icon: Users,
    title: "مجتمع نشط",
    description: "+15,000 مستخدم"
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description: "تشفير كامل للبيانات"
  }
];

const features = [
  "ملفات شخصية لا محدودة",
  "قوالب احترافية جاهزة", 
  "تحليلات مفصلة",
  "دعم فني متواصل",
  "نسخ احتياطية تلقائية",
  "تكامل مع 50+ أداة"
];

export function WhyEnhanced() {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            لماذا Rukny.io؟
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            الخيار الأول للمحترفين وأصحاب الأعمال
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Features List */}
        <div className="bg-muted/20 rounded-2xl p-8">
          <h3 className="text-lg font-semibold mb-6 text-center">ما ستحصل عليه</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}