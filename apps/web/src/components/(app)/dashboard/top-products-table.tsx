"use client";

/**
 * 📦 Top Products Table Component
 * جدول المنتجات الأكثر مبيعاً
 */

import { motion } from "framer-motion";
import { Package, TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  amount: number;
}

interface TopProductsTableProps {
  products?: TopProduct[];
  formatCurrency?: (amount: number) => string;
}

const defaultProducts: TopProduct[] = [
  { id: "1", name: "قميص رجالي كلاسيك", price: 79490, quantity: 82, amount: 6518180 },
  { id: "2", name: "بنطلون جينز", price: 128500, quantity: 37, amount: 4754500 },
  { id: "3", name: "تيشيرت قطني", price: 39990, quantity: 64, amount: 2559360 },
  { id: "4", name: "جاكيت خفيف", price: 20000, quantity: 184, amount: 3680000 },
];

function defaultFormatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US")} IQD`;
}

// تحديد لون الترتيب
const rankColors = [
  "bg-amber-500 text-white",      // #1
  "bg-slate-400 text-white",      // #2
  "bg-amber-700 text-white",      // #3
  "bg-muted text-muted-foreground", // #4+
];

export function TopProductsTable({
  products = defaultProducts,
  formatCurrency = defaultFormatCurrency,
}: TopProductsTableProps) {
  const totalAmount = products.reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
            <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">المنتجات الأكثر مبيعاً</h3>
            <p className="text-xs text-muted-foreground">أفضل {products.length} منتجات أداءً</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground sm:px-6">
                #
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground sm:px-6">
                المنتج
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground sm:px-6">
                السعر
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground sm:px-6">
                الكمية
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground sm:px-6">
                المبلغ
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30 group"
              >
                {/* Rank */}
                <td className="px-5 py-4 sm:px-6">
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold",
                    rankColors[index] || rankColors[3]
                  )}>
                    {index + 1}
                  </span>
                </td>
                
                {/* Product Name */}
                <td className="px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                
                {/* Price */}
                <td className="px-5 py-4 text-sm tabular-nums text-muted-foreground sm:px-6">
                  {formatCurrency(product.price)}
                </td>
                
                {/* Quantity */}
                <td className="px-5 py-4 sm:px-6">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-sm font-semibold tabular-nums">
                    {product.quantity}
                  </span>
                </td>
                
                {/* Amount */}
                <td className="px-5 py-4 sm:px-6">
                  <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.amount)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function TopProductsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-muted animate-pulse hidden sm:block" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-6 w-6 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded-lg bg-muted animate-pulse flex-1" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-5 w-10 rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
