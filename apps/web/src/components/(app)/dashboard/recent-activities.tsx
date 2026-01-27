"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ShoppingBag,
  Users,
  Package,
  AlertCircle,
  CalendarDays,
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  LucideIcon,
  ChevronDown,
  Filter,
  Plus,
  Edit,
  Store,
  UserCircle,
  Bell,
  CheckCircle,
  Activity,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Activity {
  id?: string;
  type:
    | "order"
    | "user"
    | "product"
    | "alert"
    | "event"
    | "form"
    | "review"
    | "message"
    | "form_created"
    | "form_updated"
    | "form_submission"
    | "event_created"
    | "event_updated"
    | "event_registration"
    | "product_created"
    | "product_updated"
    | "store_created"
    | "order_received"
    | "profile_created"
    | "profile_updated";
  title: string;
  description: string;
  time: string;
  href?: string;
  avatar?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityIcons: Record<
  string,
  { icon: LucideIcon; className: string; darkClassName: string }
> = {
  // Orders
  order: {
    icon: ShoppingBag,
    className: "text-blue-600 bg-blue-50",
    darkClassName: "dark:text-blue-400 dark:bg-blue-950/50",
  },
  order_received: {
    icon: ShoppingBag,
    className: "text-blue-600 bg-blue-50",
    darkClassName: "dark:text-blue-400 dark:bg-blue-950/50",
  },
  // Users & Profile
  user: {
    icon: Users,
    className: "text-emerald-600 bg-emerald-50",
    darkClassName: "dark:text-emerald-400 dark:bg-emerald-950/50",
  },
  profile_created: {
    icon: UserCircle,
    className: "text-emerald-600 bg-emerald-50",
    darkClassName: "dark:text-emerald-400 dark:bg-emerald-950/50",
  },
  profile_updated: {
    icon: Edit,
    className: "text-emerald-600 bg-emerald-50",
    darkClassName: "dark:text-emerald-400 dark:bg-emerald-950/50",
  },
  // Products
  product: {
    icon: Package,
    className: "text-violet-600 bg-violet-50",
    darkClassName: "dark:text-violet-400 dark:bg-violet-950/50",
  },
  product_created: {
    icon: Plus,
    className: "text-violet-600 bg-violet-50",
    darkClassName: "dark:text-violet-400 dark:bg-violet-950/50",
  },
  product_updated: {
    icon: Edit,
    className: "text-violet-600 bg-violet-50",
    darkClassName: "dark:text-violet-400 dark:bg-violet-950/50",
  },
  // Store
  store_created: {
    icon: Store,
    className: "text-orange-600 bg-orange-50",
    darkClassName: "dark:text-orange-400 dark:bg-orange-950/50",
  },
  // Alerts
  alert: {
    icon: AlertCircle,
    className: "text-amber-600 bg-amber-50",
    darkClassName: "dark:text-amber-400 dark:bg-amber-950/50",
  },
  // Events
  event: {
    icon: CalendarDays,
    className: "text-rose-600 bg-rose-50",
    darkClassName: "dark:text-rose-400 dark:bg-rose-950/50",
  },
  event_created: {
    icon: Plus,
    className: "text-rose-600 bg-rose-50",
    darkClassName: "dark:text-rose-400 dark:bg-rose-950/50",
  },
  event_updated: {
    icon: Edit,
    className: "text-rose-600 bg-rose-50",
    darkClassName: "dark:text-rose-400 dark:bg-rose-950/50",
  },
  event_registration: {
    icon: CheckCircle,
    className: "text-green-600 bg-green-50",
    darkClassName: "dark:text-green-400 dark:bg-green-950/50",
  },
  // Forms
  form: {
    icon: FileText,
    className: "text-cyan-600 bg-cyan-50",
    darkClassName: "dark:text-cyan-400 dark:bg-cyan-950/50",
  },
  form_created: {
    icon: Plus,
    className: "text-cyan-600 bg-cyan-50",
    darkClassName: "dark:text-cyan-400 dark:bg-cyan-950/50",
  },
  form_updated: {
    icon: Edit,
    className: "text-cyan-600 bg-cyan-50",
    darkClassName: "dark:text-cyan-400 dark:bg-cyan-950/50",
  },
  form_submission: {
    icon: Bell,
    className: "text-teal-600 bg-teal-50",
    darkClassName: "dark:text-teal-400 dark:bg-teal-950/50",
  },
  // Reviews & Messages
  review: {
    icon: Star,
    className: "text-yellow-600 bg-yellow-50",
    darkClassName: "dark:text-yellow-400 dark:bg-yellow-950/50",
  },
  message: {
    icon: MessageSquare,
    className: "text-indigo-600 bg-indigo-50",
    darkClassName: "dark:text-indigo-400 dark:bg-indigo-950/50",
  },
};

const filterOptions = [
  { value: "all", label: "الكل", icon: Activity },
  { value: "forms", label: "النماذج", icon: FileText },
  { value: "events", label: "الفعاليات", icon: CalendarDays },
  { value: "products", label: "المنتجات", icon: Package },
  { value: "orders", label: "الطلبات", icon: ShoppingBag },
  { value: "profile", label: "الملف الشخصي", icon: UserCircle },
];

// Helper to check if activity matches filter
function matchesFilter(activity: Activity, filter: string): boolean {
  if (filter === "all") return true;
  const filterMap: Record<string, string[]> = {
    forms: ["form", "form_created", "form_updated", "form_submission"],
    events: ["event", "event_created", "event_updated", "event_registration"],
    products: ["product", "product_created", "product_updated"],
    orders: ["order", "order_received", "store_created"],
    profile: ["user", "profile_created", "profile_updated"],
  };
  return filterMap[filter]?.includes(activity.type) || false;
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => matchesFilter(a, filter));

  const displayedActivities = showAll 
    ? filteredActivities 
    : filteredActivities.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className={cn(
        "rounded-2xl overflow-hidden flex flex-col h-full",
        "bg-gradient-to-br from-card via-card to-muted/20",
        "border border-border/50 shadow-lg"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-5 py-4 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-1.5 rounded-lg bg-primary/10"
          >
            <Activity className="w-4 h-4 text-primary" />
          </motion.div>
          <h2 className="text-sm lg:text-base font-bold text-foreground">النشاطات الأخيرة</h2>
          {filteredActivities.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary"
            >
              {filteredActivities.length}
            </motion.span>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <div className="relative group">
          <button className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all",
            "bg-background/50 hover:bg-background border border-border/50",
            "text-muted-foreground hover:text-foreground"
          )}>
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">{filterOptions.find(f => f.value === filter)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
          </button>
          <div className={cn(
            "absolute left-0 top-full mt-1.5 w-36 p-1.5 z-50",
            "rounded-xl bg-card/98 backdrop-blur-lg border border-border/60",
            "shadow-xl shadow-black/10 dark:shadow-black/30",
            "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
          )}>
            {filterOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-xs text-right transition-all flex items-center gap-2",
                    filter === option.value
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <OptionIcon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-3 relative">
        <AnimatePresence mode="popLayout">
          {displayedActivities.length > 0 ? (
            <div className="space-y-1">
              {displayedActivities.map((activity, index) => {
                const iconConfig = activityIcons[activity.type] || activityIcons.alert;
                const Icon = iconConfig.icon;
                
                const content = (
                  <>
                    <motion.div
                      className={cn(
                        "shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center",
                        "transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                        iconConfig.className,
                        iconConfig.darkClassName
                      )}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-full">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.description}
                      </p>
                    </div>
                  </>
                );
                
                return (
                  <motion.div
                    key={activity.id || `${activity.type}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.04, type: 'spring', stiffness: 300 }}
                  >
                    {activity.href ? (
                      <Link
                        href={activity.href}
                        className={cn(
                          "flex gap-3 p-3 rounded-xl transition-all cursor-pointer group",
                          "hover:bg-gradient-to-l hover:from-muted/50 hover:to-transparent",
                          "border border-transparent hover:border-border/40"
                        )}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={cn(
                        "flex gap-3 p-3 rounded-xl transition-all cursor-pointer group",
                        "hover:bg-gradient-to-l hover:from-muted/50 hover:to-transparent",
                        "border border-transparent hover:border-border/40"
                      )}>
                        {content}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-12 text-center"
            >
              <motion.div
                animate={{ y: [0, 0] }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center"
              >
                <Clock className="w-8 h-8 text-muted-foreground/50" />
              </motion.div>
              <p className="text-sm font-semibold text-muted-foreground">لا توجد نشاطات</p>
              <p className="text-xs text-muted-foreground/70 mt-1">ستظهر النشاطات هنا عند حدوثها</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Bottom Fade Shadow */}
        {displayedActivities.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show More Button */}
      {filteredActivities.length > 5 && (
        <div className="px-4 py-3 border-t border-border/40 bg-muted/10">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "w-full py-2.5 text-xs font-semibold rounded-xl transition-all",
              "flex items-center justify-center gap-1.5",
              "bg-primary/5 hover:bg-primary/10 text-primary",
              "border border-primary/20 hover:border-primary/30"
            )}
          >
            {showAll ? "عرض أقل" : `عرض الكل (${filteredActivities.length})`}
            <motion.div animate={{ rotate: showAll ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export function RecentActivitiesSkeleton() {
  return (
    <div className={cn(
      "rounded-2xl overflow-hidden flex flex-col h-full",
      "bg-gradient-to-br from-card via-card to-muted/20",
      "border border-border/50"
    )}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
          <div className="w-24 h-4 rounded bg-muted animate-pulse" />
        </div>
        <div className="w-20 h-7 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex-1 p-3 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 rounded bg-muted animate-pulse" />
                <div className="w-12 h-4 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="w-3/4 h-3 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
