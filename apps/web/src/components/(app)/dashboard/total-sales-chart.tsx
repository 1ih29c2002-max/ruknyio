"use client";

/**
 * 🛒 Total Sales Chart Component
 * رسم دائري لتوزيع المبيعات
 */

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesData {
  name: string;
  value: number;
  color: string;
}

interface TotalSalesChartProps {
  data?: SalesData[];
  totalSales?: number;
}

const defaultData: SalesData[] = [
  { name: "مباشر", value: 38.6, color: "#8b5cf6" },   // violet-500
  { name: "تابع", value: 22.5, color: "#38bdf8" },    // sky-400
  { name: "إحالة", value: 30.8, color: "#34d399" },   // emerald-400
  { name: "آخر", value: 8.1, color: "#fbbf24" },      // amber-400
];

const colorClasses: Record<string, string> = {
  "#8b5cf6": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "#38bdf8": "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "#34d399": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "#fbbf24": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: SalesData }[] }) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 text-right shadow-xl"
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <p className="text-sm font-bold text-foreground">{data.name}</p>
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: data.payload.color }}>
        {data.value.toFixed(1)}%
      </p>
    </motion.div>
  );
}

export function TotalSalesChart({ data = defaultData, totalSales = 300560 }: TotalSalesChartProps) {
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
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
            <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">إجمالي المبيعات</h3>
            <p className="text-xs text-muted-foreground">توزيع المصادر</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>+12.5%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[200px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, i) => (
                <Cell 
                  key={`cell-${i}`} 
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground mb-0.5">الإجمالي</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {(totalSales / 1000).toFixed(0)}K
          </span>
          <span className="text-[10px] text-muted-foreground">IQD</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {data.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-xl",
              colorClasses[item.color] || "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-bold tabular-nums">{item.value}%</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function TotalSalesChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="relative h-[200px] sm:h-[220px] flex items-center justify-center">
        <div className="h-[170px] w-[170px] rounded-full border-[12px] border-muted bg-transparent animate-pulse" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="h-3 w-12 bg-muted rounded animate-pulse mb-1" />
          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-3 w-8 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
