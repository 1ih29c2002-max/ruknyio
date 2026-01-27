"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = 'emerald' | 'amber' | 'sky' | 'rose' | 'violet' | 'lime' | 'coral' | 'slate' | 'gold' | 'mint' | 'lavender';

const colorConfig: Record<ColorVariant, { 
  iconBg: string;
  textColor: string;
}> = {
  emerald: { iconBg: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
  amber: { iconBg: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  sky: { iconBg: 'bg-sky-500', textColor: 'text-sky-600 dark:text-sky-400' },
  rose: { iconBg: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
  violet: { iconBg: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
  lime: { iconBg: 'bg-lime-500', textColor: 'text-lime-600 dark:text-lime-400' },
  coral: { iconBg: 'bg-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
  slate: { iconBg: 'bg-slate-500', textColor: 'text-slate-600 dark:text-slate-400' },
  gold: { iconBg: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
  mint: { iconBg: 'bg-teal-500', textColor: 'text-teal-600 dark:text-teal-400' },
  lavender: { iconBg: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
};

interface StatsCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  index?: number;
  colorVariant?: ColorVariant;
}

export function StatsCard({
  title,
  value,
  unit,
  change,
  trend,
  icon: Icon,
  colorVariant = 'emerald',
}: StatsCardProps) {
  const colors = colorConfig[colorVariant];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 hover:border-border transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", colors.iconBg)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </div>

      {/* Value & Change */}
      <div className="flex items-end justify-between gap-2">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
          trend === "up" 
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
            : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
        )}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="truncate max-w-[60px]">{change}</span>
        </div>
        <p className={cn("text-2xl font-bold tabular-nums", colors.textColor)}>{value}</p>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="h-6 w-16 bg-muted rounded-lg animate-pulse" />
        <div className="h-7 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
