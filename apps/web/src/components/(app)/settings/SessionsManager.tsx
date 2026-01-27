'use client';

import { useState, useEffect } from 'react';
import { 
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Trash2,
  LogOut,
  Loader2,
  AlertTriangle,
  CheckCircle,
  MapPin,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecuritySettings, Session } from '@/lib/hooks/settings/useSecuritySettings';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

export function SessionsManager() {
  const { getSessions, deleteSession, deleteOtherSessions } = useSecuritySettings();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoadingSessions(true);
    const data = await getSessions();
    setSessions(data);
    setLoadingSessions(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    const success = await deleteSession(sessionId);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
    setDeletingId(null);
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    const result = await deleteOtherSessions();
    if (result) {
      setSessions(prev => prev.filter(s => s.isCurrent));
      setShowConfirmModal(false);
    }
    setDeletingAll(false);
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const otherSessionsCount = sessions.filter(s => !s.isCurrent).length;

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">الجلسات النشطة</h3>
              <p className="text-xs text-muted-foreground">{sessions.length} جلسة نشطة</p>
            </div>
          </div>

          {otherSessionsCount > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إنهاء الكل</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="divide-y divide-border">
          {loadingSessions ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground text-xs mt-3">جاري تحميل الجلسات...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-xs">لا توجد جلسات نشطة</p>
            </div>
          ) : (
            sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceType);
              
              return (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                    session.isCurrent && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    session.isCurrent ? "bg-primary/10" : "bg-muted"
                  )}>
                    <DeviceIcon className={cn(
                      "w-4 h-4",
                      session.isCurrent ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-foreground truncate">
                        {session.browser || 'متصفح'} على {session.os || 'نظام'}
                      </h4>
                      {session.isCurrent && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-medium">
                          <CheckCircle className="w-2.5 h-2.5" />
                          الحالية
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                      {session.ipAddress && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {session.ipAddress}
                        </span>
                      )}
                      {session.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true, locale: arSA })}
                      </span>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingId === session.id}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-sm bg-card rounded-xl overflow-hidden border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <span className="font-semibold text-sm text-foreground">تأكيد الإنهاء</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-foreground/80 text-xs leading-relaxed">
                  سيتم إنهاء <span className="font-bold text-destructive">{otherSessionsCount}</span> جلسة أخرى. ستحتاج لتسجيل الدخول مجدداً على تلك الأجهزة.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {deletingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      تأكيد الإنهاء
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
