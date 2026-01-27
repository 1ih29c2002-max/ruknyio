'use client';

/**
 * 🔔 Global Toast/Notification System
 * 
 * Provides a unified way to show notifications across the app.
 * Uses Sonner for beautiful, accessible toasts.
 */

import { Toaster, toast as sonnerToast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  X 
} from 'lucide-react';
import { ReactNode } from 'react';

// ============ Toast Provider ============

interface ToastProviderProps {
  children?: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        dir="rtl"
        expand={false}
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          classNames: {
            toast: 'group font-sans',
            title: 'font-medium',
            description: 'text-sm opacity-90',
            actionButton: 'bg-primary text-white',
            cancelButton: 'bg-gray-100 text-gray-700',
            closeButton: 'bg-gray-100 hover:bg-gray-200',
          },
        }}
      />
    </>
  );
}

// ============ Toast Utilities ============

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

/**
 * 🎯 Unified Toast API
 */
export const toast = {
  /**
   * ✅ Success toast
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      ...options,
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });
  },

  /**
   * ❌ Error toast
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration ?? 5000, // Errors stay longer
      ...options,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    });
  },

  /**
   * ⚠️ Warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      ...options,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    });
  },

  /**
   * ℹ️ Info toast
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      ...options,
      icon: <Info className="w-5 h-5 text-blue-500" />,
    });
  },

  /**
   * ⏳ Loading toast (returns ID for later dismiss)
   */
  loading: (message: string, options?: Omit<ToastOptions, 'duration'>) => {
    return sonnerToast.loading(message, {
      ...options,
      icon: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
    });
  },

  /**
   * 🔄 Promise toast - shows loading, then success/error
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  },

  /**
   * 🗑️ Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * 📝 Custom toast with full control
   */
  custom: (content: ReactNode, options?: ToastOptions) => {
    return sonnerToast.custom(() => content, options);
  },
};

// ============ Pre-built Toast Messages ============

/**
 * 🎯 Common toast messages for consistency
 */
export const toastMessages = {
  // Auth
  loginSuccess: () => toast.success('تم تسجيل الدخول بنجاح'),
  logoutSuccess: () => toast.success('تم تسجيل الخروج'),
  sessionExpired: () => toast.warning('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'),
  
  // CRUD
  saveSuccess: () => toast.success('تم الحفظ بنجاح'),
  createSuccess: (item?: string) => toast.success(item ? `تم إنشاء ${item} بنجاح` : 'تم الإنشاء بنجاح'),
  updateSuccess: (item?: string) => toast.success(item ? `تم تحديث ${item} بنجاح` : 'تم التحديث بنجاح'),
  deleteSuccess: (item?: string) => toast.success(item ? `تم حذف ${item}` : 'تم الحذف'),
  
  // Errors
  genericError: () => toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'),
  networkError: () => toast.error('خطأ في الاتصال. تحقق من اتصالك بالإنترنت'),
  validationError: (message?: string) => toast.error(message || 'يرجى التحقق من البيانات المدخلة'),
  permissionError: () => toast.error('ليس لديك صلاحية للقيام بهذا الإجراء'),
  
  // Loading
  saving: () => toast.loading('جاري الحفظ...'),
  loading: () => toast.loading('جاري التحميل...'),
  uploading: () => toast.loading('جاري الرفع...'),
  
  // Clipboard
  copied: () => toast.success('تم النسخ'),
  
  // Forms
  formSubmitted: () => toast.success('تم إرسال النموذج بنجاح'),
  
  // Files
  uploadSuccess: () => toast.success('تم رفع الملف بنجاح'),
  uploadError: () => toast.error('فشل رفع الملف'),
  fileTooLarge: (maxSize?: string) => 
    toast.error(`حجم الملف كبير جداً${maxSize ? `. الحد الأقصى: ${maxSize}` : ''}`),
};

// ============ Confirmation Toast ============

interface ConfirmToastOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  destructive?: boolean;
}

/**
 * 🤔 Confirmation toast with action buttons
 */
export function confirmToast({
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmToastOptions) {
  return sonnerToast.custom(
    (id) => (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{title}</p>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              sonnerToast.dismiss(id);
              onCancel?.();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              sonnerToast.dismiss(id);
              onCancel?.();
            }}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={async () => {
              sonnerToast.dismiss(id);
              await onConfirm();
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              destructive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity, // Don't auto-dismiss confirmations
    }
  );
}

export default ToastProvider;
