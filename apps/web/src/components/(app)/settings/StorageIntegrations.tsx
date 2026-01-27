'use client';

import { useEffect, useState } from 'react';
import { 
  HardDrive, 
  FileImage, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  Image,
  File,
  Calendar,
  ShoppingBag,
  ClipboardList,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useStorage, formatBytes, getCategoryLabel, FileCategory, UserFile } from '@/lib/hooks/settings/useStorage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function StorageIntegrations() {
  const { 
    usage, 
    isLoading, 
    error,
    getStorageUsage, 
    getFiles,
    deleteFile 
  } = useStorage();
  
  const [files, setFiles] = useState<UserFile[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [showFiles, setShowFiles] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'ALL'>('ALL');

  useEffect(() => {
    getStorageUsage();
    loadFiles();
  }, [getStorageUsage]);

  const loadFiles = async (category?: FileCategory | 'ALL') => {
    const result = await getFiles({ 
      category: !category || category === 'ALL' ? undefined : category,
      limit: 50 
    });
    if (result) {
      setFiles(result.files);
      setTotalFiles(result.total);
    }
  };

  const handleCategoryChange = (category: FileCategory | 'ALL') => {
    setSelectedCategory(category);
    loadFiles(category === 'ALL' ? undefined : category);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${fileName}"؟`)) return;
    
    setDeletingId(fileId);
    const success = await deleteFile(fileId);
    
    if (success) {
      toast.success('تم حذف الملف بنجاح');
      setFiles(files.filter(f => f.id !== fileId));
      setTotalFiles(prev => prev - 1);
    } else {
      toast.error('فشل في حذف الملف');
    }
    
    setDeletingId(null);
  };

  const percentage = usage?.percentage || 0;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  const getProgressColor = () => {
    if (isCritical) return 'bg-destructive';
    if (isWarning) return 'bg-amber-500';
    return 'bg-primary';
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'AVATAR':
      case 'COVER':
        return Image;
      case 'FORM_COVER':
      case 'FORM_BANNER':
      case 'FORM_SUBMISSION':
        return ClipboardList;
      case 'EVENT_COVER':
      case 'EVENT_GALLERY':
        return Calendar;
      case 'PRODUCT_IMAGE':
        return ShoppingBag;
      default:
        return File;
    }
  };

  const categories: { id: FileCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'الكل' },
    { id: 'AVATAR', label: 'صور شخصية' },
    { id: 'COVER', label: 'أغلفة' },
    { id: 'FORM_COVER', label: 'نماذج' },
    { id: 'EVENT_COVER', label: 'أحداث' },
    { id: 'PRODUCT_IMAGE', label: 'منتجات' },
  ];

  // Loading State
  if (isLoading && !usage) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-xs mt-3">جاري تحميل معلومات التخزين...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-foreground font-medium text-sm mb-1">فشل في التحميل</p>
        <p className="text-muted-foreground text-xs mb-4">{error}</p>
        <button
          onClick={() => getStorageUsage()}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Storage Card */}
      <div className="bg-card rounded-xl border border-border p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">مساحة التخزين</h3>
              <p className="text-xs text-muted-foreground">إدارة الملفات المرفوعة</p>
            </div>
          </div>
          
          <button
            onClick={() => getStorageUsage()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {usage ? formatBytes(usage.used) : '0'} / {usage ? formatBytes(usage.limit) : '5 GB'}
            </span>
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              isCritical ? "bg-destructive/10 text-destructive" : isWarning ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
            )}>
              {percentage}%
            </span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              style={{ width: `${percentage}%` }}
              className={cn("h-full rounded-full transition-all duration-500", getProgressColor())}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 bg-muted/50 rounded-lg">
            <p className="text-base font-semibold text-foreground">{usage ? formatBytes(usage.used) : '0'}</p>
            <p className="text-[10px] text-muted-foreground">مستخدم</p>
          </div>
          <div className="text-center p-2.5 bg-primary/5 rounded-lg">
            <p className="text-base font-semibold text-primary">{usage ? formatBytes(usage.available) : '0'}</p>
            <p className="text-[10px] text-muted-foreground">متبقي</p>
          </div>
          <div className="text-center p-2.5 bg-muted/50 rounded-lg">
            <p className="text-base font-semibold text-foreground">{usage?.files || 0}</p>
            <p className="text-[10px] text-muted-foreground">ملف</p>
          </div>
        </div>

        {/* Warning */}
        {isWarning && (
          <div className={cn(
            "mt-3 p-3 rounded-lg flex items-center gap-2",
            isCritical ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
          )}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-xs">
              {isCritical ? 'المساحة على وشك النفاد! قم بحذف بعض الملفات.' : 'المساحة تقترب من الحد الأقصى'}
            </p>
          </div>
        )}
      </div>

      {/* Files Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowFiles(!showFiles)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <FileImage className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="font-semibold text-sm text-foreground">الملفات ({totalFiles})</span>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            showFiles && "rotate-180"
          )} />
        </button>

        {showFiles && (
          <div>
            {/* Category Filter */}
            <div className="px-4 py-2 border-t border-border flex gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Files List */}
            <div className="max-h-64 overflow-y-auto">
              {files.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FileImage className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-xs">لا توجد ملفات</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {files.map((file) => {
                    const Icon = getCategoryIcon(file.category);
                    return (
                      <div
                        key={file.id}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{file.fileName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {getCategoryLabel(file.category)} • {formatBytes(file.fileSize)}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDelete(file.id, file.fileName)}
                          disabled={deletingId === file.id}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === file.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
