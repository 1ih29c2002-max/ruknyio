"use client";

/**
 * 🎛️ لوحة التحكم - Control Panel
 * صفحة رئيسية بسيطة وسلسة
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertCircle,
  CheckCircle2,
  FileText,
  Eye,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { buildApiPath } from "@/lib/config";
import { secureFetch } from "@/lib/api/api-client";

import {
  StatsCard,
  StatsCardSkeleton,
  RecentOrders,
  RecentOrdersSkeleton,
  QuickStatsBar,
  QuickStatsBarSkeleton,
  DashboardHeader,
  DashboardHeaderSkeleton,
  RevenueChart,
  RevenueChartSkeleton,
  TotalSalesChart,
  TotalSalesChartSkeleton,
} from "@/components/(app)/dashboard";

// ============ Types ============

interface StoreStats {
  hasStore: boolean;
  storeId?: string;
  storeName?: string;
  storeStatus?: string;
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalOrders: number;
  totalRevenue: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
  items: { productName: string }[];
}

interface DashboardStats {
  events: { active: number; total: number };
  products: { active: number; total: number };
  forms: { active: number; total: number };
  views: { total: number; thisMonth: number };
}

// ============ Utility Functions ============

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function formatCurrency(amount: number): string {
  return `${formatNumber(amount)} IQD`;
}

// ============ Main Component ============

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState("7");
  const initializedRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthenticated) return;
    if (initializedRef.current && dateRange === "7") return;
    initializedRef.current = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [storeRes, orderStatsRes, ordersRes, dashboardRes] = await Promise.all([
          secureFetch(buildApiPath("/stores/stats")),
          secureFetch(buildApiPath("/orders/store/stats")),
          secureFetch(buildApiPath("/orders/store?limit=5&sortBy=createdAt&sortOrder=desc")),
          secureFetch(buildApiPath("/dashboard/stats")),
        ]);

        if (storeRes.ok) setStoreStats(await storeRes.json());
        if (orderStatsRes.ok) setOrderStats(await orderStatsRes.json());
        if (dashboardRes.ok) setDashboardStats(await dashboardRes.json());
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.data || ordersData || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange, isAuthenticated]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Stats cards data
  const statsData = [
    {
      title: "إجمالي المبيعات",
      value: formatNumber(orderStats?.totalRevenue || 0),
      unit: "IQD",
      change: orderStats?.totalRevenue ? "—" : "0",
      trend: "up" as const,
      icon: DollarSign,
      colorVariant: "lime" as const,
    },
    {
      title: "الطلبات",
      value: formatNumber(orderStats?.totalOrders || 0),
      unit: "طلب",
      change: orderStats?.pendingOrders ? `${orderStats.pendingOrders} معلق` : "—",
      trend: "up" as const,
      icon: ShoppingBag,
      colorVariant: "amber" as const,
    },
    {
      title: "المنتجات",
      value: formatNumber(storeStats?.totalProducts || 0),
      unit: "منتج",
      change: storeStats?.activeProducts ? `${storeStats.activeProducts} نشط` : "—",
      trend: "up" as const,
      icon: Package,
      colorVariant: "sky" as const,
    },
    {
      title: "نفاد المخزون",
      value: formatNumber(storeStats?.outOfStock || 0),
      unit: "منتج",
      change: storeStats?.outOfStock && storeStats.outOfStock > 0 ? "تنبيه" : "جيد",
      trend: (storeStats?.outOfStock && storeStats.outOfStock > 0 ? "down" : "up") as "up" | "down",
      icon: AlertCircle,
      colorVariant: "rose" as const,
    },
    {
      title: "الطلبات المكتملة",
      value: formatNumber(orderStats?.completedOrders || 0),
      unit: "طلب",
      change: orderStats?.totalOrders && orderStats.totalOrders > 0 
        ? `${Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)}%` 
        : "—",
      trend: "up" as const,
      icon: CheckCircle2,
      colorVariant: "emerald" as const,
    },
    {
      title: "النماذج",
      value: formatNumber(dashboardStats?.forms?.total || 0),
      unit: "نموذج",
      change: dashboardStats?.forms?.active ? `${dashboardStats.forms.active} نشط` : "—",
      trend: "up" as const,
      icon: FileText,
      colorVariant: "violet" as const,
    },
    {
      title: "المشاهدات",
      value: formatNumber(dashboardStats?.views?.total || 0),
      unit: "مشاهدة",
      change: dashboardStats?.views?.thisMonth ? `${dashboardStats.views.thisMonth} هذا الشهر` : "—",
      trend: "up" as const,
      icon: Eye,
      colorVariant: "coral" as const,
    },
    {
      title: "الفعاليات",
      value: formatNumber(dashboardStats?.events?.total || 0),
      unit: "فعالية",
      change: dashboardStats?.events?.active ? `${dashboardStats.events.active} نشط` : "—",
      trend: "up" as const,
      icon: CalendarDays,
      colorVariant: "slate" as const,
    },
  ];

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-5">
          {/* Header */}
          {loading ? (
            <DashboardHeaderSkeleton />
          ) : (
            <DashboardHeader
              storeName={storeStats?.storeName}
              hasStore={storeStats?.hasStore}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {loading
              ? statsData.slice(0, 4).map((_, i) => <StatsCardSkeleton key={i} />)
              : statsData.slice(0, 4).map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              <>
                <RevenueChartSkeleton />
                <TotalSalesChartSkeleton />
              </>
            ) : (
              <>
                <RevenueChart 
                  currentTotal={orderStats?.totalRevenue || 0}
                  previousTotal={Math.round((orderStats?.totalRevenue || 0) * 0.85)}
                />
                <TotalSalesChart 
                  totalSales={orderStats?.totalRevenue || 0}
                />
              </>
            )}
          </div>

          {/* Recent Orders */}
          {loading ? (
            <RecentOrdersSkeleton />
          ) : (
            <RecentOrders orders={recentOrders} formatCurrency={formatCurrency} />
          )}

          {/* Quick Stats */}
          {loading ? (
            <QuickStatsBarSkeleton />
          ) : (
            <QuickStatsBar
              completedOrders={orderStats?.completedOrders}
              processingOrders={orderStats?.processingOrders}
            />
          )}
          {/* Bottom Blur Gradient Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
}
