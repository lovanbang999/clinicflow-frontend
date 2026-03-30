'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useReadyLabOrders, useTechnicianHistory, useLabOrderActions } from '@/lib/hooks/useLabOrders';
import { WorklistSearchBar } from '@/components/technician/WorklistSearchBar';
import { LabOrder } from '@/lib/api/lab-orders';
import { WorklistTable } from '@/components/technician/WorklistTable';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TabKey = 'pending' | 'inProgress' | 'history';

export default function TechnicianWorklistPage() {
  const t = useTranslations('dashboard.technician');
  const tWorklist = useTranslations('dashboard.technician.worklist');
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const { orders: readyOrders, isLoading: isLoadingReady, refetch: refetchReady } = useReadyLabOrders(true);
  const { orders: historyOrders, isLoading: isLoadingHistory, refetch: refetchHistory } = useTechnicianHistory();
  const { updateStatus, isSubmitting } = useLabOrderActions();

  // Combine and pick orders depending on tab
  let sourceOrders: LabOrder[] = [];
  let isLoading = false;
  if (activeTab === 'history') {
    sourceOrders = historyOrders;
    isLoading = isLoadingHistory;
  } else {
    sourceOrders = readyOrders.filter(o => activeTab === 'pending' ? o.status === 'PAID' : o.status === 'IN_PROGRESS');
    isLoading = isLoadingReady;
  }

  // Filter orders by search
  const filteredOrders = sourceOrders.filter((order) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const patientName = order.patientProfile?.fullName?.toLowerCase() || '';
    const patientCode = order.patientProfile?.patientCode?.toLowerCase() || '';
    return patientName.includes(searchLower) || patientCode.includes(searchLower);
  });

  const handleProcessOrder = async (order: LabOrder) => {
    if (isSubmitting) return;
    try {
      await updateStatus(order.id, 'IN_PROGRESS');
      toast.success(t('messages.statusUpdated'));
      refetchReady();
    } catch (error) {
      console.error(error);
    }
  };

  const handleResultOrder = (order: LabOrder) => {
    const locale = window.location.pathname.split('/')[1];
    router.push(`/${locale}/technician/lab-worklist/${order.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f3f4] overflow-hidden">
      <div className="p-8 pb-0 shrink-0">
        <h1 className="text-2xl font-bold text-[#111518] tracking-tight">{tWorklist('title')}</h1>
        <p className="text-[#64748b] mt-1">{tWorklist('subtitle')}</p>
        
        {/* Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-gray-200">
          {(['pending', 'inProgress', 'history'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer",
                activeTab === tab 
                  ? "border-[#1392ec] text-[#1392ec]" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 pt-4 pb-4 shrink-0">
        <WorklistSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => {
            refetchReady();
            if (activeTab === 'history') refetchHistory();
          }}
          isLoading={isLoading}
        />
      </div>

      <div className="flex-1 px-8 pb-8 overflow-y-auto min-h-0">
        <WorklistTable 
          orders={filteredOrders} 
          isLoading={isLoading} 
          onProcess={handleProcessOrder} 
          onResult={handleResultOrder} 
        />
      </div>
    </div>
  );
}
