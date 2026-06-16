'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { labOrdersApi, type LabOrder } from '@/lib/api/clinical/lab-orders';
import { useApiData } from '@/lib/hooks/core/useApiData';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { WorklistSearchBar } from '@/components/technician/WorklistSearchBar';
import { toast } from 'sonner';
import { FileTextIcon, HourglassIcon, MicroscopeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon, CalendarIcon, ClockIcon } from '@phosphor-icons/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TabKey = 'pending' | 'inProgress';
type UnifiedOrder = LabOrder;

export default function TechnicianWorklistPage() {
  const t = useTranslations('technicianWorklist');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [orderIdToStart, setOrderIdToStart] = useState<string | null>(null);

  const { data: allOrders, isLoading, refetch } = useApiData(
    async () => {
      try {
        const labReady = await labOrdersApi.getReadyToPerformOrders();
        return labReady;
      } catch (err) {
        void err;
        toast.error(t('messages.fetchError'));
        return [];
      }
    },
    [],
  );

  const orders = (allOrders ?? []).filter((o: UnifiedOrder) => {
    const matchesTab =
      activeTab === 'pending' ? o.status === 'PAID' :
        activeTab === 'inProgress' ? o.status === 'IN_PROGRESS' :
          false;

    if (!matchesTab) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (o.patientProfile?.fullName ?? '').toLowerCase();
    const code = (o.patientProfile?.patientCode ?? '').toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  const handleStart = useCallback(async (orderId: string) => {
    try {
      const order = (allOrders ?? []).find(o => o.id === orderId);
      if (!order) return;

      await labOrdersApi.updateOrderStatus(orderId, 'IN_PROGRESS');
      toast.success(t('messages.statusUpdated'));
      router.push(`/technician/lab-worklist/${orderId}`);
    } catch (err) {
      void err;
      toast.error(t('messages.statusUpdateError'));
    }
  }, [allOrders, router, t]);

  // Subscribe to WebSocket: auto-refresh when a new paid lab order arrives
  const { onNewLabOrder } = useLabOrderSocket();
  useEffect(() => {
    const unsubscribe = onNewLabOrder((payload) => {
      toast.info(`🧪 ${t('messages.newOrderArrived', { name: payload.patientName })}`);

      // Track new IDs to show pulse animation
      setNewOrderIds(prev => {
        const next = new Set(prev);
        payload.labOrderIds.forEach(id => next.add(id));
        return next;
      });

      // Clear highlight after 10 seconds
      setTimeout(() => {
        setNewOrderIds(prev => {
          const next = new Set(prev);
          payload.labOrderIds.forEach(id => next.delete(id));
          return next;
        });
      }, 10000);

      void refetch();
    });
    return () => { unsubscribe?.(); };
  }, [onNewLabOrder, refetch, t]);

  const handleOpenWorkspace = (order: UnifiedOrder) => {
    router.push(`/technician/lab-worklist/${order.id}`);
  };

  const tabs = [
    { key: 'pending' as TabKey, label: <div className="flex items-center gap-1.5"><HourglassIcon size={18} weight="duotone" /> <span>{t('tabs.pending')} ({(allOrders ?? []).filter((o: LabOrder) => o.status === 'PAID').length})</span></div> },
    { key: 'inProgress' as TabKey, label: <div className="flex items-center gap-1.5"><MicroscopeIcon size={18} weight="duotone" /> <span>{t('tabs.inProgress')} ({(allOrders ?? []).filter((o: LabOrder) => o.status === 'IN_PROGRESS').length})</span></div> },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Filters & Tabs Area - Clean toolbar row inside the gray workspace under layout header */}
      <div className="bg-[#f8fafc] border-b border-slate-200/60 px-8 py-4 shrink-0 flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div>
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as TabKey);
            }}
            className="w-full"
          >
            <TabsList className="bg-slate-100/80 p-1 rounded-xl">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="px-6 py-2 rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1392ec] data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Search & Refresh & History Link */}
        <div className="flex items-center gap-3">
          <WorklistSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={refetch}
            isLoading={isLoading}
          />
          
          <Button
            variant="outline"
            onClick={() => router.push('/technician/history')}
            className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-600 hover:text-[#1392ec] hover:border-[#1392ec]/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <CheckCircleIcon size={18} weight="bold" className="text-slate-500" />
            <span>{t('tabs.history')}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-8 py-8 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-5 border-slate-200 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <Skeleton className="h-3 w-1/4 rounded-md" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileTextIcon size={40} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg">{t('worklist.empty')}</p>
            <p className="text-slate-400 text-sm mt-1">{t('worklist.emptyDesc') || 'No orders found matching your search.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: UnifiedOrder) => {
              const patient = order.patientProfile;
              const doctor = order.booking?.doctor;
              const isNew = newOrderIds.has(order.id);

              return (
                <Card
                  key={order.id}
                  className={cn(
                    "group relative overflow-hidden border-slate-200 hover:border-[#1392ec]/40 hover:shadow-md transition-all duration-300 cursor-pointer",
                    isNew && "ring-2 ring-[#1392ec]/40 ring-offset-2"
                  )}
                  onClick={() => handleOpenWorkspace(order)}
                >
                  {isNew && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1392ec] animate-pulse" />
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-[#1392ec] transition-colors truncate">
                            {order.testName}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2",
                              order.status === 'PAID' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                order.status === 'IN_PROGRESS' ? "bg-blue-50 text-[#1392ec] border-blue-100" :
                                  "bg-emerald-50 text-emerald-600 border-emerald-100"
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                          {patient && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <UserIcon size={16} className="text-slate-400" />
                              <span className="font-semibold text-slate-700">{patient.fullName}</span>
                              <span className="text-slate-400">({patient.patientCode})</span>
                            </div>
                          )}

                          {doctor && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <MicroscopeIcon size={16} className="text-slate-400" />
                              <span>{t('worklist.doctorPrefix')} {doctor.fullName}</span>
                            </div>
                          )}

                          {/* Assignment badge */}
                          {order.assignedTechnicianId ? (
                            <Badge className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2">
                              👤 {t('worklist.assigned')}
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2">
                              🔄 {t('worklist.auto')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                          {order.orderedAt && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <CalendarIcon size={14} />
                              {format(new Date(order.orderedAt), 'dd/MM/yyyy')}
                            </div>
                          )}
                          {order.orderedAt && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <ClockIcon size={14} />
                              {format(new Date(order.orderedAt), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                        {order.status === 'PAID' && (
                          <Button
                            size="sm"
                            className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white font-bold px-5 h-9 rounded-xl shadow-sm shadow-[#1392ec]/20"
                            onClick={(e) => { e.stopPropagation(); setOrderIdToStart(order.id); }}
                          >
                            {t('worklist.actions.start')}
                          </Button>
                        )}
                        {order.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 h-9 rounded-xl shadow-sm shadow-emerald-600/20"
                            onClick={(e) => { e.stopPropagation(); handleOpenWorkspace(order); }}
                          >
                            {t('worklist.actions.result')}
                          </Button>
                        )}
                        {order.status === 'COMPLETED' && (
                          <div className="h-9 flex items-center pr-2">
                            <CheckCircleIcon size={24} weight="fill" className="text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!orderIdToStart} onOpenChange={(open) => !open && setOrderIdToStart(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('worklist.confirmStartTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('worklist.confirmStartDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('workspace.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderIdToStart) {
                  void handleStart(orderIdToStart);
                  setOrderIdToStart(null);
                }
              }}
              className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white"
            >
              {t('worklist.actions.start')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
