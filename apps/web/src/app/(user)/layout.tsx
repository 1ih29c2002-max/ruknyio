"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarSkeleton } from '@/components/(app)/sheard/sidebar';
import { NotificationsSidebar, NotificationsSidebarSkeleton } from '@/components/(app)/sheard/notifications-sidebar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show main sidebar on settings pages (they have their own sidebar)
  const isSettingsPage = pathname?.startsWith('/app/settings');

  return (
    <div className="flex h-svh overflow-hidden" dir="rtl">
      {!isSettingsPage && (
        <div className="hidden md:block">
          {mounted ? <Sidebar /> : <SidebarSkeleton />}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Notifications Sidebar - Right side */}
      {!isSettingsPage && (
        <div className="hidden xl:block ms-2">
          {mounted ? <NotificationsSidebar /> : <NotificationsSidebarSkeleton />}
        </div>
      )}
    </div>
  );
}
