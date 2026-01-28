"use client";

import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";
import { Star, Quote, Sparkles } from "lucide-react";

const reviews = [
  {
    name: "أحمد محمد",
    username: "@ahmed_dev",
    role: "مطور برمجيات",
    body: "منصة رائعة جداً، ساعدتني في تنظيم فعالياتي بشكل احترافي. أنصح بها بقوة!",
    img: "https://i.pravatar.cc/150?img=1",
    rating: 5,
  },
  {
    name: "فاطمة العلي",
    username: "@fatima_design",
    role: "مصممة جرافيك",
    body: "التصميم جميل والواجهة سهلة الاستخدام. تجربة ممتازة للمبتدئين والمحترفين.",
    img: "https://i.pravatar.cc/150?img=5",
    rating: 5,
  },
  {
    name: "المهندس مصطفى عمار",
    username: "@ruknyio",
    role: "مدير عام",
    body: "كمدير العام لشركة تقنية، أجد هذه المنصة أداة لا غنى عنها لتنظيم وإدارة الفعاليات.",
    img: "https://i.pravatar.cc/150?img=3",
    rating: 5,
  },
  {
    name: "عمر السالم",
    username: "@omar_tech",
    role: "رائد أعمال",
    body: "أفضل منصة لإدارة الملفات الشخصية. الميزات متطورة والدعم ممتاز.",
    img: "https://i.pravatar.cc/150?img=8",
    rating: 5,
  },
  {
    name: "نور الدين",
    username: "@noor_events",
    role: "منظم فعاليات",
    body: "استخدمتها لتنظيم مؤتمر كبير وكانت النتائج مذهلة. أداة لا غنى عنها!",
    img: "https://i.pravatar.cc/150?img=12",
    rating: 5,
  },
  {
    name: "ليلى حسن",
    username: "@layla_creative",
    role: "صانعة محتوى",
    body: "كمبدعة محتوى، هذه المنصة وفرت لي الكثير من الوقت والجهد. شكراً!",
    img: "https://i.pravatar.cc/150?img=9",
    rating: 5,
  },
  {
    name: "محمود رشيد",
    username: "@mahmoud_startup",
    role: "مؤسس شركة ناشئة",
    body: "ساعدتني في إطلاق شركتي الناشئة بطريقة احترافية. أنصح جميع رواد الأعمال بها.",
    img: "https://i.pravatar.cc/150?img=15",
    rating: 5,
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
  role,
  rating,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  role: string;
  rating: number;
}) => {
  return (
    <figure
      className={cn(
        "group relative h-full w-[340px] cursor-pointer overflow-hidden rounded-2xl border p-6 mx-3",
        "border-border/40 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/30 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5",
        "transition-all duration-500"
      )}
    >
      {/* Decorative quote */}
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <Quote className="h-10 w-10 text-primary" />
      </div>
      
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      
      {/* Review text */}
      <blockquote className="text-base leading-relaxed mb-6 text-foreground/90">
        "{body}"
      </blockquote>
      
      {/* Author info */}
      <div className="flex flex-row items-center gap-4 pt-4 border-t border-border/30">
        <div className="relative">
          <img 
            className="rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" 
            width="48" 
            height="48" 
            alt={name} 
            src={img} 
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
        </div>
        <div className="flex flex-col">
          <figcaption className="text-sm font-bold text-foreground">
            {name}
          </figcaption>
          <p className="text-xs text-primary font-medium">{role}</p>
          <p className="text-xs text-muted-foreground">{username}</p>
        </div>
      </div>
      
      {/* Gradient highlight on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </figure>
  );
};

export function TestimonialsSection() {
  return (
    <section className="py-28 px-4 md:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="container max-w-6xl">
        {/* Section Header - Enhanced */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-8">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            آراء العملاء
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            ماذا يقول{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">عملاؤنا</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            تجارب حقيقية من مستخدمين راضين عن خدماتنا ومنتجاتنا
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-8 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {reviews.slice(0, 4).map((review, i) => (
                  <img key={i} src={review.img} alt="" className="w-8 h-8 rounded-full border-2 border-background" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">+1000 مستخدم سعيد</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm font-semibold mr-1">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Marquee Reviews - Enhanced */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl">
          <Marquee className="[--duration:30s]" pauseOnHover>
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse className="[--duration:30s] mt-4" pauseOnHover>
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          
          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background via-background/80 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}