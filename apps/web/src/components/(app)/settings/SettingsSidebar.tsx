'use client';

/**
 * ⚙️ Settings Sidebar Component
 * شريط جانبي لمعلومات الحساب في صفحة الإعدادات
 */

import { useState, useEffect, useRef } from 'react';
import { 
  User,
  Mail,
  Edit3,
  Eye,
  Crown,
  CheckCircle,
  ChevronDown,
  Lightbulb,
  Shield,
  Bell,
  Globe,
  ExternalLink,
  Sparkles,
  Camera,
  AlertCircle,
  X,
  Loader2,
  Image,
  Video,
  Wand2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useProfileSettings } from '@/lib/hooks/settings/useProfileSettings';
import Link from 'next/link';

// ============ Types ============

interface ProfileTip {
  id: string;
  icon: any;
  title: string;
  description: string;
  href?: string;
  completed?: boolean;
}

// ============ Profile Completion Calculator ============

function calculateProfileCompletion(user: any): { percentage: number; missing: string[] } {
  const fields = [
    { key: 'name', label: 'الاسم الكامل', weight: 25 },
    { key: 'email', label: 'البريد الإلكتروني', weight: 25 },
    { key: 'avatar', label: 'صورة الملف الشخصي', weight: 20 },
    { key: 'username', label: 'اسم المستخدم', weight: 15 },
    { key: 'emailVerified', label: 'تأكيد البريد', weight: 15 },
  ];

  let completed = 0;
  const missing: string[] = [];

  fields.forEach(field => {
    if (user?.[field.key] && user[field.key] !== '') {
      completed += field.weight;
    } else {
      missing.push(field.label);
    }
  });

  return { percentage: Math.min(completed, 100), missing };
}

// ============ Profile Image Menu Modal ============

interface ProfileImageMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectVideo: () => void;
  onRestyleWithAI: () => void;
  onDesignWithCanva: () => void;
  onDeleteImage: () => void;
  hasCurrentImage: boolean;
  isDeleting?: boolean;
}

function ProfileImageMenu({ 
  isOpen, 
  onClose, 
  onSelectImage, 
  onSelectVideo,
  onRestyleWithAI,
  onDesignWithCanva,
  onDeleteImage,
  hasCurrentImage,
  isDeleting
}: ProfileImageMenuProps) {
  const menuItems = [
    {
      id: 'image',
      icon: Image,
      label: 'اختيار صورة أو GIF',
      labelEn: 'Select image or GIF',
      onClick: onSelectImage,
      iconBg: 'bg-zinc-100 dark:bg-zinc-800',
      iconColor: 'text-zinc-600 dark:text-zinc-400',
    },
    {
      id: 'video',
      icon: Video,
      label: 'اختيار فيديو',
      labelEn: 'Select video',
      onClick: onSelectVideo,
      iconBg: 'bg-lime-500/10',
      iconColor: 'text-lime-600 dark:text-lime-400',
    },
    {
      id: 'ai',
      icon: Wand2,
      label: 'تعديل الصورة بالذكاء الاصطناعي',
      labelEn: 'Restyle your image with AI',
      onClick: onRestyleWithAI,
      iconBg: 'bg-fuchsia-500/10',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      badge: 'قريباً',
      disabled: true,
    },
    {
      id: 'canva',
      icon: () => (
        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Canva</span>
      ),
      label: 'تصميم باستخدام Canva',
      labelEn: 'Design with Canva',
      onClick: onDesignWithCanva,
      iconBg: 'bg-purple-500/10',
      iconColor: '',
      badge: 'قريباً',
      disabled: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-50">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              صورة الملف الشخصي
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-2" dir="rtl">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      onClose();
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors group",
                    item.disabled 
                      ? "opacity-60 cursor-not-allowed" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    item.iconBg
                  )}>
                    {typeof Icon === 'function' && item.id === 'canva' ? (
                      <Icon />
                    ) : (
                      <Icon className={cn("w-4 h-4", item.iconColor)} />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {item.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 rotate-180" />
                  </div>
                </button>
              );
            })}

            {/* Divider */}
            {hasCurrentImage && (
              <>
                <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />
                
                {/* Delete Option */}
                <button
                  onClick={() => {
                    onDeleteImage();
                    onClose();
                  }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      حذف الصورة الحالية
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300 dark:text-red-800 rotate-180" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ============ Edit Profile Modal ============

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername: string;
  initialBio: string;
  onSave: (data: { username: string; bio: string }) => Promise<boolean>;
  isLoading: boolean;
}

function EditProfileModal({ isOpen, onClose, initialUsername, initialBio, onSave, isLoading }: EditProfileModalProps) {
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);

  useEffect(() => {
    setUsername(initialUsername);
    setBio(initialBio);
  }, [initialUsername, initialBio, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave({ username: username.trim(), bio: bio.trim() });
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              العنوان والوصف
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3 space-y-3" dir="rtl">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                العنوان
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={30}
                  className="w-full px-3 py-2 pr-7 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  placeholder="username"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 text-left" dir="ltr">
                {username.length} / 30
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                الوصف
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                placeholder="نبذة عنك..."
              />
              <p className="text-[10px] text-zinc-400 mt-1 text-left" dir="ltr">
                {bio.length} / 160
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              <span>حفظ</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ============ Main Component ============

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const { user, refreshUser, isLoading: isAuthLoading } = useAuth();
  const { uploadAvatar, updateProfile, isLoading } = useProfileSettings();
  const [expandedSection, setExpandedSection] = useState<'profile' | 'tips' | null>('profile');
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { percentage, missing } = calculateProfileCompletion(user);

  // Handle avatar menu open
  const handleAvatarClick = () => {
    setIsImageMenuOpen(true);
  };

  // Handle image selection
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  // Handle video selection
  const handleSelectVideo = () => {
    videoInputRef.current?.click();
  };

  // Handle AI restyle (placeholder)
  const handleRestyleWithAI = () => {
    // TODO: Implement AI restyle feature
    console.log('Restyle with AI - Coming soon');
  };

  // Handle Canva design (placeholder)
  const handleDesignWithCanva = () => {
    // TODO: Implement Canva integration
    console.log('Design with Canva - Coming soon');
  };

  // Handle delete avatar
  const handleDeleteAvatar = async () => {
    setIsDeleting(true);
    try {
      // Call API to delete avatar - using updateProfile with empty avatar
      const success = await updateProfile({ avatar: '' } as any);
      if (success && refreshUser) {
        await refreshUser();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url && refreshUser) {
        await refreshUser();
      }
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle profile update
  const handleProfileSave = async (data: { username: string; bio: string }): Promise<boolean> => {
    const success = await updateProfile({ username: data.username, bio: data.bio });
    if (success && refreshUser) {
      await refreshUser();
    }
    return success;
  };

  // Dynamic tips based on missing fields
  const tips: ProfileTip[] = [
    {
      id: '1',
      icon: Camera,
      title: 'أضف صورة شخصية',
      description: 'الصورة تزيد من مصداقية حسابك',
      href: '/app/settings?tab=profile',
      completed: !!user?.avatar,
    },
    {
      id: '2',
      icon: Shield,
      title: 'أكمل ملفك الشخصي',
      description: 'أضف اسمك الكامل',
      href: '/app/settings?tab=profile',
      completed: !!user?.name,
    },
    {
      id: '3',
      icon: Globe,
      title: 'أكد بريدك الإلكتروني',
      description: 'للحصول على جميع المميزات',
      href: '/app/settings?tab=profile',
      completed: !!user?.emailVerified,
    },
    {
      id: '4',
      icon: Bell,
      title: 'اختر اسم مستخدم',
      description: 'اسم مميز لحسابك',
      href: '/app/settings?tab=profile',
      completed: !!user?.username,
    },
  ];

  const incompleteTips = tips.filter(t => !t.completed);

  const toggleSection = (section: 'profile' | 'tips') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Show skeleton while mounting (brief)
  if (!mounted) return <SettingsSidebarSkeleton className={className} />;
  
  // If auth is still loading after mount, show skeleton briefly then fallback
  if (isAuthLoading) {
    return <SettingsSidebarSkeleton className={className} />;
  }
  
  // If no user after loading, show a minimal sidebar
  if (!user) {
    return (
      <aside 
        className={cn(
          "flex flex-col w-[280px] h-[calc(100svh-theme(spacing.8))] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
          className
        )}
        dir="rtl"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <User className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              يرجى تسجيل الدخول
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition-colors"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.gif"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Hidden file input for video upload */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Profile Image Menu Modal */}
      <ProfileImageMenu
        isOpen={isImageMenuOpen}
        onClose={() => setIsImageMenuOpen(false)}
        onSelectImage={handleSelectImage}
        onSelectVideo={handleSelectVideo}
        onRestyleWithAI={handleRestyleWithAI}
        onDesignWithCanva={handleDesignWithCanva}
        onDeleteImage={handleDeleteAvatar}
        hasCurrentImage={!!user?.avatar}
        isDeleting={isDeleting}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialUsername={(user as any)?.username || ''}
        initialBio={(user as any)?.bio || ''}
        onSave={handleProfileSave}
        isLoading={isLoading}
      />

      <aside 
        className={cn(
          "flex flex-col w-[280px] h-[calc(100svh-theme(spacing.8))] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
          className
        )}
        dir="rtl"
      >
        {/* Profile Header */}
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col items-center text-center">
            {/* Avatar - Clickable */}
            <div className="relative mb-3">
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="group relative w-16 h-16 rounded-full overflow-hidden bg-violet-500 p-0.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || user.username || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-500/10">
                      <User className="w-6 h-6 text-violet-500" />
                    </div>
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>
              {/* Camera badge */}
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center pointer-events-none">
                <Camera className="w-3 h-3 text-zinc-500" />
              </div>
            </div>

            {/* Name & Email */}
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              {user?.name || user?.username || 'مستخدم جديد'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user?.email || 'لم يتم تحديد البريد'}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 w-full">
              <Link
                href={`/u/${user?.username || user?.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض</span>
              </Link>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>
          </div>
        </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Profile Completion Section */}
        <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('profile')}
            className={cn(
              "flex w-full items-center justify-between gap-2 p-2.5 text-right transition-colors",
              expandedSection === 'profile'
                ? "bg-violet-500/5"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                percentage === 100 
                  ? "bg-emerald-500/10" 
                  : "bg-amber-500/10"
              )}>
                {percentage === 100 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">اكتمال الملف</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {percentage === 100 ? 'مكتمل' : `${missing.length} حقول ناقصة`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-semibold",
                percentage === 100 ? "text-emerald-600" : "text-amber-600"
              )}>
                {percentage}%
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-zinc-400 transition-transform duration-200",
                expandedSection === 'profile' && "rotate-180"
              )} />
            </div>
          </button>

          {expandedSection === 'profile' && (
            <div className="px-2.5 pb-2.5 space-y-2">
              {/* Progress Bar */}
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    percentage === 100 ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Missing Fields */}
              {missing.length > 0 ? (
                <div className="space-y-1">
                  {missing.slice(0, 3).map((field, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{field}</span>
                    </div>
                  ))}
                  {missing.length > 3 && (
                    <p className="text-[10px] text-zinc-400 pr-3.5">
                      +{missing.length - 3} حقول أخرى
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>ملفك الشخصي مكتمل!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        {incompleteTips.length > 0 && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('tips')}
              className={cn(
                "flex w-full items-center justify-between gap-2 p-2.5 text-right transition-colors",
                expandedSection === 'tips'
                  ? "bg-sky-500/5"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">نصائح</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">تحسين حسابك</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium">
                  {incompleteTips.length}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-zinc-400 transition-transform duration-200",
                  expandedSection === 'tips' && "rotate-180"
                )} />
              </div>
            </button>

            {expandedSection === 'tips' && (
              <div className="px-2 pb-2 space-y-1">
                {incompleteTips.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <Link
                      key={tip.id}
                      href={tip.href || '#'}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-500 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {tip.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {tip.description}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-violet-400 transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Footer */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <Link
          href="/app/settings?tab=subscription"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition-colors"
        >
          <Crown className="w-4 h-4" />
          <span>ترقية الحساب</span>
        </Link>
      </div>
    </aside>
    </>
  );
}

// ============ Skeleton Component ============

export function SettingsSidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside 
      className={cn(
        "flex flex-col w-[280px] h-[calc(100svh-theme(spacing.8))] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse",
        className
      )}
      dir="rtl"
    >
      {/* Profile Header Skeleton */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-3" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24 mb-2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
          <div className="flex gap-2 mt-3 w-full">
            <div className="flex-1 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="flex-1 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-3 space-y-2">
        <div className="h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </div>

      {/* Footer Skeleton */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </div>
    </aside>
  );
}

