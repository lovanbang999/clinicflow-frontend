'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { labOrdersApi, type LabOrder } from '@/lib/api/clinical/lab-orders';
import { useApiData } from '@/lib/hooks/core/useApiData';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { WorklistSearchBar } from '@/components/technician/WorklistSearchBar';
import { toast } from 'sonner';
import { SpinnerIcon, FileTextIcon, HourglassIcon, MicroscopeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type TabKey = 'pending' | 'inProgress' | 'completed';

export default function TechnicianWorklistPage() {
  const t = useTranslations('technicianWorklist');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allOrders, isLoading, refetch } = useApiData(
    async () => {
      try {
        const [ready, completed] = await Promise.all([
          labOrdersApi.getReadyToPerformOrders(),
          labOrdersApi.getTechnicianHistory(),
        ]);
        return [...ready, ...completed];
      } catch {
        toast.error(t('messages.fetchError'));
        return [];
      }
    },
    [],
  );

  const orders = (allOrders ?? []).filter((o: LabOrder) => {
    const matchesTab =
      activeTab === 'pending' ? o.status === 'PAID' :
        activeTab === 'inProgress' ? o.status === 'IN_PROGRESS' :
          o.status === 'COMPLETED';

    if (!matchesTab) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (o.patientProfile?.fullName ?? '').toLowerCase();
    const code = (o.patientProfile?.patientCode ?? '').toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  const handleStart = useCallback(async (orderId: string) => {
    try {
      await labOrdersApi.updateOrderStatus(orderId, 'IN_PROGRESS');
      toast.success(t('messages.statusUpdated'));
      const locale = window.location.pathname.split('/')[1];
      router.push(`/${locale}/technician/lab-worklist/${orderId}`);
    } catch {
      toast.error(t('messages.statusUpdateError'));
    }
  }, [router, t]);

  // Subscribe to WebSocket: auto-refresh when a new paid lab order arrives
  const { onNewLabOrder } = useLabOrderSocket();
  useEffect(() => {
    const unsubscribe = onNewLabOrder((payload) => {
      toast.info(`🧪 ${t('messages.newOrderArrived', { name: payload.patientName })}`);
      void refetch();
    });
    return () => { unsubscribe?.(); };
  }, [onNewLabOrder, refetch, t]);

  const handleOpenWorkspace = (order: LabOrder) => {
    const locale = window.location.pathname.split('/')[1];
    router.push(`/${locale}/technician/lab-worklist/${order.id}`);
  };

  const tabs: { key: TabKey; label: React.ReactNode }[] = [
    { key: 'pending', label: <div className="flex items-center gap-1.5"><HourglassIcon size={18} weight="duotone" /> <span>{t('tabs.pending')} ({(allOrders ?? []).filter((o: LabOrder) => o.status === 'PAID').length})</span></div> },
    { key: 'inProgress', label: <div className="flex items-center gap-1.5"><MicroscopeIcon size={18} weight="duotone" /> <span>{t('tabs.inProgress')} ({(allOrders ?? []).filter((o: LabOrder) => o.status === 'IN_PROGRESS').length})</span></div> },
    { key: 'completed', label: <div className="flex items-center gap-1.5"><CheckCircleIcon size={18} weight="duotone" /> <span>{t('tabs.history')} ({(allOrders ?? []).filter((o: LabOrder) => o.status === 'COMPLETED').length})</span></div> },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f3f4] overflow-hidden">
      <div className="p-8 pb-0 shrink-0">
        <h1 className="text-2xl font-bold text-[#111518] tracking-tight">{t('worklist.title')}</h1>
        <p className="text-[#64748b] mt-1">{t('worklist.subtitle')}</p>

        <div className="flex items-center gap-6 mt-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer',
                activeTab === tab.key
                  ? 'border-[#1392ec] text-[#1392ec]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 pt-4 pb-4 shrink-0">
        <WorklistSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={refetch}
          isLoading={isLoading}
        />
      </div>

      <div className="flex-1 px-8 pb-8 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <SpinnerIcon size={32} className="animate-spin text-slate-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileTextIcon size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">{t('worklist.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: LabOrder) => {
              const patient = order.patientProfile;
              const doctor = order.booking?.doctor;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => order.status !== 'PAID' && handleOpenWorkspace(order)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-[15px]">{order.testName}</span>
                      </div>
                      {patient && (
                        <p className="text-sm text-slate-600">
                          🧑‍⚕️ {patient.fullName} · {patient.patientCode}
                          {doctor && <span className="text-slate-400"> · {t('worklist.doctorPrefix')} {doctor.fullName}</span>}
                        </p>
                      )}
                      {order.orderedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          {t('worklist.columns.date')} {format(new Date(order.orderedAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {order.status === 'PAID' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); void handleStart(order.id); }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          {t('worklist.actions.start')}
                        </button>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenWorkspace(order); }}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          {t('worklist.actions.result')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
