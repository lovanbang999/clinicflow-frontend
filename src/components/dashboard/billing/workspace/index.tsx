'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBilling } from '@/lib/hooks/billing/useBilling';
import { BillingKpiStrip } from './BillingKpiStrip';
import { BillingQueuePanel } from './BillingQueuePanel';
import { BillingDetailWorkspace } from './BillingDetailWorkspace';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { ReceiptIcon } from '@phosphor-icons/react';

interface BillingWorkspaceProps {
  preSelectedBookingId?: string | null;
}

export function BillingWorkspace({ preSelectedBookingId }: BillingWorkspaceProps) {
  const {
    workspaceQueue,
    loadingQueue,
    fetchWorkspaceQueue,
    workspaceKpis,
    loadingKpis,
    fetchWorkspaceKpis,
  } = useBilling();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(preSelectedBookingId || null);
  const [prevId, setPrevId] = useState(preSelectedBookingId);

  // Sync selectedBookingId if preSelectedBookingId changes without using useEffect
  if (preSelectedBookingId !== prevId) {
    setPrevId(preSelectedBookingId);
    setSelectedBookingId(preSelectedBookingId ?? null);
  }
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handlers
  const handleRefresh = useCallback(async () => {
    void fetchWorkspaceQueue({ search: searchQuery });
    void fetchWorkspaceKpis();
  }, [fetchWorkspaceQueue, fetchWorkspaceKpis, searchQuery]);

  // Initial fetch
  useEffect(() => {
    void handleRefresh();
  }, [handleRefresh]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchWorkspaceQueue({ search: searchQuery });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchWorkspaceQueue]);

  // WebSocket sync
  const { onBillingRefresh } = useLabOrderSocket();
  useEffect(() => {
    if (!onBillingRefresh) return;
    return onBillingRefresh(() => {
      void handleRefresh();
    });
  }, [onBillingRefresh, handleRefresh]);

  const selectedItem = workspaceQueue.find(i => i.bookingId === selectedBookingId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Top metrics always visible */}
      <BillingKpiStrip kpis={workspaceKpis} isLoading={loadingKpis} />

      <div className="flex-1 flex overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-sm">
        {/* Left Queue Panel (Fixed width) */}
        <div className="w-[380px] h-full shrink-0">
          <BillingQueuePanel
            items={workspaceQueue}
            isLoading={loadingQueue}
            selectedBookingId={selectedBookingId}
            onSelect={setSelectedBookingId}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Right Detail Panel (Flexible) */}
        <div className="flex-1 h-full bg-white relative overflow-hidden">
          {selectedBookingId && selectedItem ? (
            <BillingDetailWorkspace 
              bookingId={selectedBookingId}
              onRefreshQueue={handleRefresh}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/30">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6">
                <ReceiptIcon size={40} weight="duotone" className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Workspace Thu Ngân</h3>
              <p className="max-w-xs text-center text-sm font-medium mt-2 leading-relaxed">
                Chọn một bệnh nhân từ danh sách bên trái để bắt đầu quy trình thanh toán.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
