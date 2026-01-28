"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  User,
  Calendar,
  FileText,
  BarChart3,
  Sparkles,
  Link2,
  Shield,
  Zap,
} from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

const features = [
  {
    Icon: User,
    name: "ملفات شخصية ديناميكية",
    description:
      "اصنع ملفك الشخصي التفاعلي مع قوالب جاهزة وتخصيص كامل. شارك رابطك الفريد مع العالم.",
    href: "/features/profiles",
    cta: "اكتشف المزيد",
    className: "col-span-3 lg:col-span-2 lg:row-span-2",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10" />
        {/* Animated Circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
        {/* Mock Profile Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-2xl opacity-60 group-hover:opacity-80 transition-opacity">
          <div className="p-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 mb-3" />
            <div className="w-24 h-3 bg-foreground/20 rounded mb-2" />
            <div className="w-16 h-2 bg-muted-foreground/20 rounded mb-4" />
            <div className="w-full space-y-2">
              <div className="w-full h-8 bg-primary/10 rounded-lg" />
              <div className="w-full h-8 bg-primary/10 rounded-lg" />
              <div className="w-full h-8 bg-primary/10 rounded-lg" />
            </div>
          </div>
        </div>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
  {
    Icon: Calendar,
    name: "إدارة الفعاليات",
    description: "نظم فعالياتك وأدر التسجيلات والتذاكر بسهولة تامة",
    href: "/features/events",
    cta: "جرب الآن",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5" />
        {/* Calendar Grid Mock */}
        <div className="absolute top-8 right-4 grid grid-cols-7 gap-1 opacity-30 group-hover:opacity-50 transition-opacity">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-sm",
                i === 10 || i === 15
                  ? "bg-emerald-500"
                  : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
  {
    Icon: FileText,
    name: "نماذج ذكية",
    description: "أنشئ نماذج تفاعلية مع منطق شرطي متقدم وتحقق فوري",
    href: "/features/forms",
    cta: "ابدأ الإنشاء",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5" />
        {/* Form Fields Mock */}
        <div className="absolute top-8 right-4 left-4 space-y-2 opacity-30 group-hover:opacity-50 transition-opacity">
          <div className="h-6 bg-violet-500/20 rounded w-3/4" />
          <div className="h-8 bg-card/50 rounded border border-border/30" />
          <div className="h-6 bg-violet-500/20 rounded w-1/2" />
          <div className="h-8 bg-card/50 rounded border border-border/30" />
        </div>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
  {
    Icon: BarChart3,
    name: "تحليلات متقدمة",
    description: "تتبع الأداء واحصل على رؤى عميقة لتحسين نتائجك مع لوحات تحكم تفاعلية",
    href: "/features/analytics",
    cta: "استكشف البيانات",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5" />
        {/* Chart Bars Mock */}
        <div className="absolute bottom-16 right-8 left-8 flex items-end gap-2 h-20 opacity-30 group-hover:opacity-50 transition-opacity">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-500/50 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
  {
    Icon: Link2,
    name: "روابط اجتماعية",
    description: "اربط جميع حساباتك في مكان واحد",
    href: "/features/links",
    cta: "تعرف أكثر",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5" />
        {/* Social Icons Mock */}
        <div className="absolute top-8 right-4 flex flex-wrap gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
          {["bg-blue-500", "bg-pink-500", "bg-sky-500", "bg-red-500", "bg-green-500"].map(
            (color, i) => (
              <div key={i} className={cn("w-8 h-8 rounded-lg", color)} />
            )
          )}
        </div>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
  {
    Icon: Shield,
    name: "أمان متقدم",
    description: "حماية كاملة لبياناتك مع تشفير من الدرجة الأولى",
    href: "/features/security",
    cta: "اعرف المزيد",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
        {/* Shield Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
  {
    Icon: Zap,
    name: "أداء فائق",
    description: "سرعة تحميل خاطفة وتجربة سلسة على جميع الأجهزة",
    href: "/features/performance",
    cta: "شاهد السرعة",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
        {/* Lightning Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-500/30 rounded-full blur-xl animate-pulse" />
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.8}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
      </div>
    ),
  },
];

export function BentoFeaturesSection() {
  return (
    <section className="py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            منصة متكاملة
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            كل ما تحتاجه{" "}
            <span className="bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              في مكان واحد
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            أدوات قوية ومتكاملة لإدارة حضورك الرقمي بكفاءة واحترافية
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            وأكثر من ذلك بكثير...{" "}
            <a
              href="/features"
              className="text-primary hover:underline font-medium"
            >
              استكشف جميع الميزات ←
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
