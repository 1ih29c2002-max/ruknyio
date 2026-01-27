'use client';

/**
 * 📊 Quick Stats Bar Component
 * شريط ملخص سريع - تصميم بسيط
 */

import { TrendingUp, Clock, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsBarProps {
  completedOrders?: number;
  processingOrders?: number;
}

export function QuickStatsBar({ completedOrders = 0, processingOrders = 0 }: QuickStatsBarProps) {
  const totalOrders = completedOrders + processingOrders;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const stats = [
    { label: 'معدل الإكمال', value: `${completionRate}%`, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'قيد المعالجة', value: processingOrders.toString(), icon: Clock, color: 'bg-amber-500' },
    { label: 'مكتملة', value: completedOrders.toString(), icon: CheckCircle2, color: 'bg-sky-500' },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">ملخص الطلبات</span>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <div className={cn("p-1 rounded-md", stat.color)}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold tabular-nums">{stat.value}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function QuickStatsBarSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
          <div className="w-24 h-4 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30">
              <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-1">
                <div className="w-8 h-5 bg-muted rounded animate-pulse" />
                <div className="w-14 h-3 bg-muted rounded animate-pulse hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
