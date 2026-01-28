"use client";

import { Card } from "@/components/ui/card";
import {
  User,
  Calendar,
  FileText,
  Zap,
  Shield,
  Smartphone,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: User,
    title: "ملفات شخصية مخصصة",
    description:
      "أنشئ ملفات شخصية جميلة ومخصصة تعرض علامتك التجارية وتربطك بجمهورك.",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "إدارة الفعاليات",
    description:
      "نظّم وأدر الفعاليات بسهولة مع أدوات قوية للتسجيل وإصدار التذاكر.",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: FileText,
    title: "نماذج ذكية",
    description:
      "ابنِ نماذج ديناميكية مع ميزات متقدمة مثل المنطق الشرطي والتدفقات متعددة الخطوات.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Zap,
    title: "سرعة فائقة",
    description:
      "أداء محسّن يضمن تحميل محتواك فوراً، مما يوفر أفضل تجربة مستخدم.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description:
      "أمان على مستوى المؤسسات مع ضمان وقت تشغيل 99.9% للحفاظ على بياناتك آمنة ومتاحة.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Smartphone,
    title: "متوافق مع الجوال",
    description:
      "تصميم متجاوب بالكامل يعمل بشكل مثالي على جميع الأجهزة، من سطح المكتب إلى الجوال.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            لماذا تختارنا؟
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            كل ما تحتاجه{" "}
            <span className="text-primary">للنجاح</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ميزات قوية ومتطورة لمساعدتك على بناء وإدارة وتنمية حضورك الرقمي باحترافية
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={cn(
                  "relative p-6 border-border/40 transition-all duration-500 group cursor-pointer",
                  "hover:border-transparent hover:shadow-xl hover:-translate-y-2",
                  "bg-card/50 backdrop-blur-sm overflow-hidden"
                )}
              >
                {/* Gradient Border on Hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
                    "bg-gradient-to-br",
                    feature.color
                  )}
                  style={{ padding: "1px" }}
                >
                  <div className="absolute inset-[1px] bg-card rounded-[inherit]" />
                </div>

                {/* Glow Effect */}
                <div
                  className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    feature.color
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    "mb-5 inline-flex p-3.5 rounded-xl transition-all duration-300",
                    feature.bgColor,
                    "group-hover:scale-110"
                  )}
                >
                  <Icon className={cn("h-6 w-6", feature.iconColor)} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom Highlight */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-r",
                    feature.color
                  )}
                />
              </Card>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 pt-16 border-t border-border/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "99.9%", label: "وقت التشغيل" },
              { value: "<100ms", label: "زمن الاستجابة" },
              { value: "256-bit", label: "تشفير البيانات" },
              { value: "24/7", label: "دعم فني" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
