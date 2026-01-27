'use client';

/**
 * 📢 Notifications Sidebar Component
 * Right sidebar with notifications, activities, and contacts
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  User, 
  Package, 
  ShoppingBag, 
  FileText, 
  CalendarDays,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Notification {
  id: string;
  title: string;
  time: string;
  read?: boolean;
}

interface Activity {
  id: string;
  icon: 'bug' | 'release' | 'submit' | 'modify' | 'delete';
  title: string;
  time: string;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

interface NotificationsSidebarProps {
  notifications?: Notification[];
  activities?: Activity[];
  contacts?: Contact[];
}

// Activity icons mapping
const activityIcons = {
  bug: { icon: AlertCircle, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
  release: { icon: Package, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  submit: { icon: FileText, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  modify: { icon: CheckCircle, color: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30' },
  delete: { icon: AlertCircle, color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' },
};

// Default demo data
const defaultNotifications: Notification[] = [
  { id: '1', title: 'لديك طلب جديد يحتاج مراجعة...', time: 'الآن' },
  { id: '2', title: 'مستخدم جديد سجل في المتجر', time: 'منذ 59 دقيقة' },
  { id: '3', title: 'تم تأكيد الطلب #1234', time: 'منذ 12 ساعة' },
  { id: '4', title: 'أحمد اشترك في خدمتك', time: 'اليوم، 11:59 ص' },
];

const defaultActivities: Activity[] = [
  { id: '1', icon: 'bug', title: 'لديك مشكلة تحتاج حل...', time: 'الآن' },
  { id: '2', icon: 'release', title: 'تم إصدار نسخة جديدة', time: 'منذ 59 دقيقة' },
  { id: '3', icon: 'submit', title: 'تم استلام نموذج جديد', time: 'منذ 12 ساعة' },
  { id: '4', icon: 'modify', title: 'تم تعديل بيانات الصفحة', time: 'اليوم، 11:59 ص' },
  { id: '5', icon: 'delete', title: 'تم حذف منتج من المتجر', time: '1 فبراير، 2025' },
];

const defaultContacts: Contact[] = [
  { id: '1', name: 'ناتالي', color: 'bg-pink-500' },
  { id: '2', name: 'درو', color: 'bg-blue-500' },
  { id: '3', name: 'أورلاندو', color: 'bg-emerald-500' },
  { id: '4', name: 'أندي', color: 'bg-amber-500' },
  { id: '5', name: 'كيت', color: 'bg-violet-500' },
  { id: '6', name: 'كوري', color: 'bg-rose-500' },
];

export function NotificationsSidebar({
  notifications = defaultNotifications,
  activities = defaultActivities,
  contacts = defaultContacts,
}: NotificationsSidebarProps) {
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 4);
  const displayedActivities = showAllActivities ? activities : activities.slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col bg-card border-r border-border overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Notifications Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              الإشعارات
            </h3>
            {notifications.length > 4 && (
              <button 
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAllNotifications ? 'عرض أقل' : 'عرض الكل'}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <AnimatePresence>
              {displayedNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className="group p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Activities Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              النشاطات
            </h3>
            {activities.length > 5 && (
              <button 
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAllActivities ? 'عرض أقل' : 'عرض الكل'}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <AnimatePresence>
              {displayedActivities.map((activity, index) => {
                const iconConfig = activityIcons[activity.icon];
                const Icon = iconConfig.icon;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      iconConfig.color
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Contacts Section */}
        <section>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <User className="w-4 h-4" />
            جهات الاتصال
          </h3>
          
          <div className="space-y-2">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {contact.avatar ? (
                  <Image 
                    src={contact.avatar} 
                    alt={contact.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium",
                    contact.color || 'bg-primary'
                  )}>
                    {contact.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {contact.name}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function NotificationsSidebarSkeleton() {
  return (
    <div className="w-full h-full flex flex-col bg-card border-r border-border p-4 space-y-6 animate-pulse">
      {/* Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="w-16 h-4 bg-muted rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2 p-2.5">
            <div className="w-1.5 h-1.5 bg-muted rounded-full mt-1.5" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="w-16 h-4 bg-muted rounded" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-2.5 p-2.5">
            <div className="w-7 h-7 bg-muted rounded-lg" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Contacts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="w-20 h-4 bg-muted rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2.5 p-2">
            <div className="w-7 h-7 bg-muted rounded-full" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
