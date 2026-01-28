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
  Star,
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
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: Calendar,
    title: "إدارة الفعاليات",
    description:
      "نظّم وأدر الفعاليات بسهولة مع أدوات قوية للتسجيل وإصدار التذاكر.",
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    icon: FileText,
    title: "نماذج ذكية",
    description:
      "ابنِ نماذج ديناميكية مع ميزات متقدمة مثل المنطق الشرطي والتدفقات متعددة الخطوات.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
    shadowColor: "shadow-violet-500/20",
  },
  {
    icon: Zap,
    title: "سرعة فائقة",
    description:
      "أداء محسّن يضمن تحميل محتواك فوراً، مما يوفر أفضل تجربة مستخدم.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    shadowColor: "shadow-amber-500/20",
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description:
      "أمان على مستوى المؤسسات مع ضمان وقت تشغيل 99.9% للحفاظ على بياناتك آمنة ومتاحة.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
    shadowColor: "shadow-green-500/20",
  },
  {
    icon: Smartphone,
    title: "متوافق مع الجوال",
    description:
      "تصميم متجاوب بالكامل يعمل بشكل مثالي على جميع الأجهزة، من سطح المكتب إلى الجوال.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-500",
    shadowColor: "shadow-pink-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 px-4 md:px-8 relative overflow-hidden">
      {/* Enhanced Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-[150px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container max-w-6xl">
        {/* Section Header - Enhanced */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 shadow-lg shadow-primary/5">
            <Sparkles className="h-4 w-4 animate-pulse" />
            لماذا تختارنا؟
            <Star className="h-4 w-4" />
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            كل ما تحتاجه{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">للنجاح</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ميزات قوية ومتطورة لمساعدتك على بناء وإدارة وتنمية حضورك الرقمي باحترافية
          </p>
        </div>

        {/* Features Grid - Enhanced */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={cn(
                  "relative p-8 border-border/30 transition-all duration-500 group cursor-pointer",
                  "hover:border-transparent hover:-translate-y-3",
                  "bg-card/50 backdrop-blur-sm overflow-hidden",
                  "hover:shadow-2xl",
                  feature.shadowColor
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Gradient Border on Hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl",
                    "bg-gradient-to-br",
                    feature.color
                  )}
                  style={{ padding: "1.5px" }}
                >
                  <div className="absolute inset-[1.5px] bg-card rounded-[calc(1rem-1.5px)]" />
                </div>

                {/* Glow Effect */}
                <div
                  className={cn(
                    "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-700",
                    "bg-gradient-to-br",
                    feature.color
                  )}
                />

                {/* Icon with enhanced styling */}
                <div
                  className={cn(
                    "relative mb-6 inline-flex p-4 rounded-2xl transition-all duration-500",
                    feature.bgColor,
                    "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl",
                    feature.shadowColor
                  )}
                >
                  <Icon className={cn("h-7 w-7", feature.iconColor)} />
                  
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-50 group-hover:animate-ping" />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold mb-4 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight className="h-5 w-5 opacity-0 -translate-x-2 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 text-primary" />
                </h3>
                <p className="relative text-muted-foreground leading-relaxed text-base">
                  {feature.description}
                </p>

                {/* Bottom Highlight */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-b-2xl",
                    "bg-gradient-to-r",
                    feature.color
                  )}
                />
                
                {/* Corner decoration */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={cn("w-8 h-8 rounded-full blur-xl", feature.bgColor)} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Stats - Enhanced */}
        <div className="mt-20 pt-16 border-t border-border/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: "99.9%", label: "وقت التشغيل", icon: "⚡" },
              { value: "<100ms", label: "زمن الاستجابة", icon: "🚀" },
              { value: "256-bit", label: "تشفير البيانات", icon: "🔒" },
              { value: "24/7", label: "دعم فني", icon: "💬" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="group text-center p-6 rounded-2xl hover:bg-muted/30 transition-all duration-300 cursor-default"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
