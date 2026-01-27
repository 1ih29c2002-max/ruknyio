"use client";

/**
 * 📍 Sales by Location Component
 * المبيعات حسب المحافظة
 */

import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationData {
  name: string;
  value: number;
  percentage: number;
}

interface SalesByLocationProps {
  data?: LocationData[];
}

const defaultData: LocationData[] = [
  { name: "بغداد", value: 45000, percentage: 72 },
  { name: "البصرة", value: 28000, percentage: 59 },
  { name: "أربيل", value: 22000, percentage: 35 },
  { name: "السليمانية", value: 18000, percentage: 61 },
];

function formatVal(num: number): string {
  return num >= 1000 ? `${(num / 1000).toFixed(0)}K` : String(num);
}

const barColors = [
  { bar: "bg-violet-500", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  { bar: "bg-sky-500", bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
  { bar: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { bar: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
];

export function SalesByLocation({ data = defaultData }: SalesByLocationProps) {
  const totalValue = data.reduce((sum, loc) => sum + loc.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20">
            <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">المبيعات حسب المحافظة</h3>
            <p className="text-xs text-muted-foreground">توزيع جغرافي</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{formatVal(totalValue)} IQD</span>
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-4">
        {data.map((loc, i) => {
          const color = barColors[i % barColors.length];
          return (
            <motion.div 
              key={loc.name} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", color.bar)} />
                  <span className="font-semibold text-foreground">{loc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold tabular-nums", color.text)}>
                    {loc.percentage}%
                  </span>
                  <span className="tabular-nums text-muted-foreground text-xs">
                    {formatVal(loc.value)} IQD
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${loc.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                  className={cn("absolute inset-y-0 left-0 rounded-full", color.bar)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function SalesByLocationSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded-lg bg-muted animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-muted animate-pulse" />
                <div className="h-4 w-14 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
