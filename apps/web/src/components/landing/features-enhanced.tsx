"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "ملفات شخصية احترافية",
    description: "اصنع ملفك الشخصي التفاعلي مع قوالب جاهزة"
  },
  {
    title: "إدارة الفعاليات",
    description: "نظم فعالياتك وتتبع الحضور بسهولة"
  },
  {
    title: "نماذج ذكية",
    description: "ابني نماذج مع المنطق الشرطي والتحقق التلقائي"
  },
  {
    title: "أداء سريع",
    description: "تحميل فوري مع أحدث التقنيات السحابية"
  },
  {
    title: "أمان متقدم",
    description: "حماية شاملة مع التشفير الكامل"
  },
  {
    title: "متوافق مع الجوال",
    description: "يعمل بشكل مثالي على جميع الأجهزة"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col items-start gap-4">
          
          <Badge>المنصة</Badge>
          
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-bold">
              كل ما تحتاجه
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              أدوات بسيطة وقوية لبناء حضورك الرقمي
            </p>
          </div>

          <div className="w-full pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <Check className="w-5 h-5 mt-1 text-primary shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}