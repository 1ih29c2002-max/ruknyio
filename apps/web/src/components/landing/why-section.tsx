"use client";

import { Zap, Clock, Shield, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "إعداد سريع",
    description: "ابدأ في أقل من 5 دقائق بدون أي تعقيدات تقنية"
  },
  {
    icon: Clock,
    title: "جاهز على الفور",
    description: "ملفك الشخصي جاهز للنشر فوراً بعد الإنشاء"
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description: "بنية تحتية آمنة ومطابقة لأعلى معايير الأمان"
  },
  {
    icon: Headphones,
    title: "دعم متواصل",
    description: "فريق الدعم جاهز لمساعدتك في أي وقت"
  }
];

export function WhySection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-muted/30">
      <div className="container max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            لماذا Rukny.io؟
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نوفر لك كل ما تحتاجه للنجاح في إدارة حضورك الرقمي
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="inline-flex p-4 rounded-2xl bg-background mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
