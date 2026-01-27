"use client";

/**
 * 📈 Revenue Chart Component
 * رسم بياني للإيرادات مع مقارنة الفترات
 */

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueDataPoint {
  name: string;
  current: number;
  previous: number;
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  currentTotal?: number;
  previousTotal?: number;
}

const defaultData: RevenueDataPoint[] = [
  { name: "يناير", current: 4000, previous: 2400 },
  { name: "فبراير", current: 3000, previous: 1398 },
  { name: "مارس", current: 2000, previous: 9800 },
  { name: "أبريل", current: 2780, previous: 3908 },
  { name: "مايو", current: 1890, previous: 4800 },
  { name: "يونيو", current: 2390, previous: 3800 },
];

function formatNum(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return String(num);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 text-right shadow-xl"
    >
      <p className="mb-2 text-sm font-bold text-foreground">{label}</p>
      <div className="space-y-1.5 text-xs">
        <p className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-muted-foreground">هذا الأسبوع</span>
          </span>
          <span className="font-bold text-foreground">{formatNum(payload[0]?.value ?? 0)} IQD</span>
        </p>
        <p className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-muted-foreground">الأسبوع السابق</span>
          </span>
          <span className="text-muted-foreground">{formatNum(payload[1]?.value ?? 0)} IQD</span>
        </p>
      </div>
    </motion.div>
  );
}

const primaryColor = "#8b5cf6"; // violet-500
const secondaryColor = "#38bdf8"; // sky-400

export function RevenueChart({
  data = defaultData,
  currentTotal = 68211,
  previousTotal = 68768,
}: RevenueChartProps) {
  const percentageChange = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6"
    >
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-500/20">
              <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-base font-bold text-foreground">الإيرادات</h3>
          </div>
          <p className="text-xs text-muted-foreground">مقارنة الأداء بين الفترتين</p>
        </div>
        
        {/* Change Badge */}
        <div className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
          isPositive 
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        )}>
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          <span>{Math.abs(percentageChange).toFixed(1)}%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
          <span className="text-foreground font-medium">هذا الأسبوع:</span>
          <span className="font-bold text-violet-600 dark:text-violet-400">{formatNum(currentTotal)} IQD</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
          <span className="text-foreground font-medium">السابق:</span>
          <span className="font-bold text-sky-600 dark:text-sky-400">{formatNum(previousTotal)} IQD</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={formatNum}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="current"
              stroke={primaryColor}
              strokeWidth={2.5}
              fill="url(#revCurrent)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke={secondaryColor}
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="url(#revPrevious)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
            <div className="h-5 w-20 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-7 w-36 rounded-lg bg-muted animate-pulse" />
        <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="h-[200px] sm:h-[260px] rounded-xl bg-muted/50 animate-pulse" />
    </div>
  );
}
