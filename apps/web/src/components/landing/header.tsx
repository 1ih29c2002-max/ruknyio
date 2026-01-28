"use client";

import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Menu, ChevronDown, User, FileText, ShoppingBag, Calendar, X, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/useAuth";

const products = [
  {
    name: "الملف الشخصي",
    description: "اصنع ملفك الشخصي التفاعلي",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    hoverBgColor: "group-hover:bg-blue-200 dark:group-hover:bg-blue-900",
    href: "/profile"
  },
  {
    name: "الفورما", 
    description: "نماذج ذكية لجمع البيانات",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950",
    hoverBgColor: "group-hover:bg-green-200 dark:group-hover:bg-green-900",
    href: "/forms"
  },
  {
    name: "المتجر",
    description: "أطلق متجرك الإلكتروني",
    icon: ShoppingBag,
    color: "text-purple-600", 
    bgColor: "bg-purple-100 dark:bg-purple-950",
    hoverBgColor: "group-hover:bg-purple-200 dark:group-hover:bg-purple-900",
    href: "/store"
  },
  {
    name: "الأحداث",
    description: "نظم فعالياتك باحترافية",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    hoverBgColor: "group-hover:bg-orange-200 dark:group-hover:bg-orange-900",
    href: "/events"
  }
];

export function Header() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isAuthenticated = false; // TODO: implement useAuth hook

  // تأثير الظل عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? 'bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-lg shadow-black/5' 
            : 'bg-transparent'
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo - Enhanced */}
        <Link href="/" className="flex items-center group gap-1">
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            Rukny
          </span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">.io</span>
          <span className="hidden sm:inline-flex mr-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
            BETA
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Products Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300",
              isProductsOpen 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}>
              <Sparkles className="h-3.5 w-3.5" />
              المنتجات
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-300",
                isProductsOpen && 'rotate-180'
              )} />
            </button>
            
            {/* Dropdown Menu - Enhanced */}
            <div 
              className={cn(
                "absolute top-full right-0 pt-3 transition-all duration-300",
                isProductsOpen 
                  ? 'opacity-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 -translate-y-3 pointer-events-none'
              )}
            >
              <div className="w-80 bg-background/95 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-2xl shadow-black/10 p-3 overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
                
                {products.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Link
                      key={index}
                      href={product.href}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60 transition-all duration-300"
                    >
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        product.bgColor,
                        product.hoverBgColor,
                        "group-hover:scale-110 group-hover:shadow-lg"
                      )}>
                        <Icon className={cn("h-5 w-5", product.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                          {product.name}
                          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rotate-180" />
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {product.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <Link 
            href="#developers" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
          >
            المطورين
          </Link>
          <Link 
            href="#pricing" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
          >
            الأسعار
          </Link>
        </nav>

        {/* CTA Buttons - Enhanced */}
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          {isAuthenticated ? (
            <Link href="/app">
              <Button className="rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" className="rounded-xl text-sm font-medium hover:bg-muted/50 transition-all duration-300">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 gap-2">
                  <Sparkles className="h-4 w-4" />
                  ابدأ مجاناً
                </Button>
              </Link>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-xl hover:bg-muted/50 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu className={cn(
                "h-5 w-5 absolute transition-all duration-300",
                isMobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
              )} />
              <X className={cn(
                "h-5 w-5 absolute transition-all duration-300",
                isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              )} />
            </div>
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu - Enhanced */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-40 transition-all duration-500",
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        style={{ top: '64px' }}
      >
        {/* Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-500",
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 bg-background/98 backdrop-blur-2xl border-b border-border/40 shadow-2xl transition-all duration-500",
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          )}
        >
          {/* Decorative gradient line */}
          <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
          
          <div className="container px-4 py-8 space-y-8">
            {/* Mobile Products */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest px-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                المنتجات
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Link
                      key={index}
                      href={product.href}
                      className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-primary/20 transition-all duration-300 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                        product.bgColor
                      )}>
                        <Icon className={cn("h-6 w-6", product.color)} />
                      </div>
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{product.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex gap-3">
              <Link 
                href="#developers" 
                className="flex-1 py-4 text-center text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 rounded-2xl transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                المطورين
              </Link>
              <Link 
                href="#pricing" 
                className="flex-1 py-4 text-center text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 rounded-2xl transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                الأسعار
              </Link>
            </div>
            
            {/* Mobile CTA */}
            {!isAuthenticated && (
              <div className="pt-6 border-t border-border/40 space-y-3">
                <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 rounded-2xl font-semibold text-base">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-2xl font-semibold text-base shadow-lg shadow-primary/20 gap-2">
                    <Sparkles className="h-4 w-4" />
                    ابدأ مجاناً
                  </Button>
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="pt-6 border-t border-border/40">
                <Link href="/app" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-2xl font-semibold text-base shadow-lg shadow-primary/20">
                    لوحة التحكم
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </header>
    </>
  );
}
