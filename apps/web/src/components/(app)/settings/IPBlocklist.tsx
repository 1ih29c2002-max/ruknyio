'use client';

import { useState, useEffect } from 'react';
import { 
  Ban,
  Plus,
  Loader2,
  Globe,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecuritySettings, BlockedIP } from '@/lib/hooks/settings/useSecuritySettings';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export function IPBlocklist() {
  const { getBlockedIPs, blockIP, unblockIP, isLoading, error, setError } = useSecuritySettings();
  
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loadingIPs, setLoadingIPs] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadBlockedIPs();
  }, []);

  const loadBlockedIPs = async () => {
    setLoadingIPs(true);
    const data = await getBlockedIPs();
    setBlockedIPs(data);
    setLoadingIPs(false);
  };

  const handleUnblock = async (ipId: string) => {
    setRemovingId(ipId);
    const success = await unblockIP(ipId);
    if (success) {
      setBlockedIPs(prev => prev.filter(ip => ip.id !== ipId));
    }
    setRemovingId(null);
  };

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      setError('يرجى إدخال عنوان IP');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP.trim())) {
      setError('عنوان IP غير صالح');
      return;
    }

    setAdding(true);
    const success = await blockIP(newIP.trim(), newReason.trim() || undefined);
    if (success) {
      await loadBlockedIPs();
      setShowAddModal(false);
      setNewIP('');
      setNewReason('');
    }
    setAdding(false);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewIP('');
    setNewReason('');
    setError(null);
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-semibold text-foreground">قائمة IP المحظورة</h3>
                <p className="text-[10px] text-muted-foreground">
                  {blockedIPs.length} عنوان محظور
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>حظر IP جديد</span>
            </button>
          </div>
        </div>

        {/* Blocked IPs List */}
        <div className="divide-y divide-border">
          {loadingIPs ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin mx-auto" />
              <p className="text-muted-foreground text-xs mt-3">جاري تحميل القائمة...</p>
            </div>
          ) : blockedIPs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Ban className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-foreground text-sm font-medium">لا توجد عناوين IP محظورة</p>
              <p className="text-muted-foreground text-xs mt-1">
                يمكنك حظر عناوين IP مشبوهة لحماية حسابك
              </p>
            </div>
          ) : (
            blockedIPs.map((ip) => (
              <div
                key={ip.id}
                className="p-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-red-500" />
                  </div>

                  {/* IP Info */}
                  <div className="flex-1 min-w-0 text-right">
                    <h4 className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded inline-block">
                      {ip.ipAddress}
                    </h4>
                    
                    {ip.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        السبب: {ip.reason}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground flex-wrap justify-end">
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        محظور منذ {formatDistanceToNow(new Date(ip.createdAt), { locale: ar })}
                      </span>
                      {ip.expiresAt && (
                        <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          ينتهي في {format(new Date(ip.expiresAt), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unblock Button */}
                <button
                  type="button"
                  onClick={() => handleUnblock(ip.id)}
                  disabled={removingId === ip.id}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 text-xs font-medium"
                >
                  {removingId === ip.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'رفع الحظر'
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add IP Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-md bg-card rounded-xl border border-border overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">حظر عنوان IP</h2>
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Ban className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1 text-right">
                    عنوان IP
                  </label>
                  <input
                    type="text"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-background text-foreground outline-none font-mono text-xs text-left transition-colors"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1 text-right">
                    السبب (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="محاولات تسجيل دخول مشبوهة"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-background text-foreground outline-none text-xs text-right transition-colors"
                  />
                </div>

                {error && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleAddIP}
                    disabled={adding || !newIP.trim()}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {adding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        حظر IP
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
