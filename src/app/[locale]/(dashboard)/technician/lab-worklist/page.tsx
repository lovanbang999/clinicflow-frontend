'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useReadyLabOrders, useLabOrderActions } from '@/lib/hooks/useLabOrders';
import { WorklistSearchBar } from '@/components/technician/WorklistSearchBar';
import { LabOrder } from '@/lib/api/lab-orders';
import { WorklistTable } from '@/components/technician/WorklistTable';
import { toast } from 'sonner';

export default function TechnicianWorklistPage() {
  const t = useTranslations('dashboard.technician.worklist');
  const router = useRouter();
  
  const { orders, isLoading, refetch } = useReadyLabOrders(true);
  const { updateStatus, isSubmitting } = useLabOrderActions();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
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
      toast.success('Đã tiếp nhận thành công');
      refetch();
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
      <div className="p-8 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-[#111518] tracking-tight">{t('title')}</h1>
        <p className="text-[#64748b] mt-1">{t('subtitle')}</p>
      </div>

      <WorklistSearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refetch}
        isLoading={isLoading}
      />

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
