'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TrashIcon, PlusIcon, StethoscopeIcon } from '@phosphor-icons/react';
import { LabResultContent } from '@/components/shared/LabResultContent';
import { useTranslations } from 'next-intl';
import type { DraftServiceOrder } from '../DoctorConsultationView';
import { UserIcon } from '@phosphor-icons/react';

interface TabServicesProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  draftServices: DraftServiceOrder[];
  setDraftServices: (val: DraftServiceOrder[]) => void;
  onChange: () => void;
  isReadOnly?: boolean;
}

export function TabServices({ item, medicalRecord, draftServices, setDraftServices, onChange, isReadOnly }: TabServicesProps) {
  const t = useTranslations('emr.visit.servicesTab');
  const tShared = useTranslations('emr.visit.shared');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STATUS_CONFIG = {
    PENDING:     { label: t('statuses.pendingPayment'), className: 'bg-amber-50 text-amber-700 border-amber-200' },
    PAID:        { label: t('statuses.paid'),  className: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { label: t('statuses.inProgress'), className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    COMPLETED:   { label: t('statuses.completed'),       className: 'bg-green-50 text-green-700 border-green-200' },
    CANCELLED:   { label: t('statuses.cancelled'),         className: 'bg-gray-100 text-gray-500 border-gray-200' },
  } as const;

  // Fix 1: Filter only Nhóm 2 — services performed by DOCTOR (specialist)
  const { services: specialistServices, isLoading } = useServices({
    isActive: true,
    performedBy: 'DOCTOR',
  });

  const orders = medicalRecord?.visitServiceOrders || [];
  const dbTotalPrice = orders.reduce((sum, order) => sum + Number(order.service?.price ?? 0), 0);
  const draftTotalPrice = draftServices.reduce((sum, d) => sum + Number(d.service.price ?? 0), 0);
  const totalPrice = dbTotalPrice + draftTotalPrice;

  // Ids already ordered or drafted — prevent duplicate add
  const existingServiceIds = new Set([
    ...orders.map((o) => o.serviceId),
    ...draftServices.map((d) => d.service.id)
  ]);
  const availableServices = specialistServices.filter((s) => !existingServiceIds.has(s.id));

  // Group remaining services by category
  const groupedServices = availableServices.reduce((acc, s) => {
    const catName = s.category?.name || 'Chuyên khoa khác';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(s);
    return acc;
  }, {} as Record<string, typeof specialistServices>);

  const handleAdd = () => {
    if (!selectedServiceId || isReadOnly) return;
    const serviceToAdd = specialistServices.find((s) => s.id === selectedServiceId);
    if (!serviceToAdd) return;
    
    // Initialize with first available doctor if exists, or null
    const defaultDoctorId = serviceToAdd.doctorServices?.[0]?.doctorProfile?.user?.id;

    setDraftServices([...draftServices, { 
      service: serviceToAdd, 
      performedBy: defaultDoctorId 
    }]);
    setSelectedServiceId('');
  };

  const handleDoctorChange = (serviceId: string, doctorId: string) => {
    if (isReadOnly) return;
    setDraftServices(draftServices.map(d => 
      d.service.id === serviceId ? { ...d, performedBy: doctorId } : d
    ));
  };

  const handleRemove = async (orderId: string) => {
    if (isReadOnly) return;
    try {
      setIsSubmitting(true);
      await medicalRecordsApi.removeServiceOrder(item.bookingId, orderId);
      toast.success(t('messages.removeSuccess'));
      onChange();
    } catch (error) {
      console.error(error);
      toast.error(t('messages.removeError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <StethoscopeIcon size={14} className="text-blue-600" />
          <div className="text-[13px] font-medium text-slate-800">{t('title')}</div>
          {isReadOnly && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2">{tShared('readOnly')}</span>}
          <span className="text-[10px] text-slate-400 ml-auto">{t('group2')}</span>
        </div>

        <div className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 rounded-md p-2 mb-4">
          {t('description')}
        </div>

        {/* List of ordered services */}
        <div className="flex flex-col gap-2 mb-4">
          {orders.length === 0 && draftServices.length === 0 ? (
            <div className="text-center p-4 text-[12px] text-slate-400 italic">
              {t('emptyList')}
            </div>
          ) : (
            <>
              {/* Saved Orders */}
              {orders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                const isCompleted = order.status === 'COMPLETED';
                return (
                  <div
                    key={order.id}
                    className={`flex justify-between items-center p-2.5 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-slate-800 truncate">{order.service.name}</div>
                      {isCompleted && order.resultText && (
                        <div className="mt-2">
                          <LabResultContent 
                            text={order.resultText} 
                            imageUrls={order.resultFileUrl ? [order.resultFileUrl] : []}
                            className="!p-2 !bg-white/50"
                          />
                        </div>
                      )}
                      {/* Find original service to display doctor */}
                      {(() => {
                        const originalService = specialistServices?.find(s => s.id === order.serviceId);
                        if (originalService?.doctorServices && originalService.doctorServices.length > 0) {
                          return (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              Thực hiện: {originalService.doctorServices.map(ds => ds.doctorProfile.user.fullName).join(', ')}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[12px] font-semibold text-slate-700 min-w-[60px] text-right">
                        {(order.service.price ?? 0).toLocaleString('vi-VN')} đ
                      </span>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemove(order.id)}
                          disabled={isSubmitting || order.status !== 'PENDING'}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={order.status !== 'PENDING' ? t('cantRemove') : t('removeOrder')}
                        >
                          <TrashIcon size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Draft Orders */}
              {draftServices.map((draft) => (
                 <div
                   key={draft.service.id}
                   className="flex justify-between items-center p-2.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/50"
                 >
                   <div className="flex-1 min-w-0">
                     <div className="text-[12px] font-medium text-blue-800 truncate">{draft.service.name}</div>
                     
                     <div className="mt-1.5 flex items-center gap-2">
                       <UserIcon size={12} className="text-blue-500" />
                       <select
                         className="bg-white border border-blue-200 rounded px-2 py-0.5 text-[11px] text-blue-700 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                         value={draft.performedBy || ''}
                         onChange={(e) => handleDoctorChange(draft.service.id, e.target.value)}
                         disabled={isReadOnly}
                       >
                         <option value="">-- Chọn bác sĩ thực hiện --</option>
                         {draft.service.doctorServices?.map((ds, idx) => (
                           <option key={ds.doctorProfile.user.id || idx} value={ds.doctorProfile.user.id}>
                             {ds.doctorProfile.user.fullName}
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 shrink-0 ml-2">
                     <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-white text-blue-500 border-blue-200 italic">
                       {t('draft')}
                     </span>
                     <span className="text-[12px] font-semibold text-slate-700 min-w-[60px] text-right">
                       {(draft.service.price ?? 0).toLocaleString('vi-VN')} đ
                     </span>
                     {!isReadOnly && (
                       <button
                         onClick={() => setDraftServices(draftServices.filter(d => d.service.id !== draft.service.id))}
                         className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                         title={t('discard')}
                       >
                         <TrashIcon size={15} />
                       </button>
                     )}
                   </div>
                 </div>
              ))}
            </>
          )}
        </div>

        {/* Add new service */}
        {!isReadOnly && (
          <div className="flex gap-2">
            <select
              className="flex-1 border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 bg-white disabled:opacity-50"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={isLoading || isSubmitting || isReadOnly}
            >
              <option value="">{t('placeholder')}</option>
              {Object.entries(groupedServices).map(([categoryName, servicesList]) => (
                <optgroup key={categoryName} label={categoryName}>
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {(s.price ?? 0).toLocaleString('vi-VN')} đ
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <Button
              onClick={handleAdd}
              disabled={!selectedServiceId || isSubmitting || isReadOnly}
              className="bg-blue-600 hover:bg-blue-700 text-white h-[38px] px-4 rounded-md text-[12px]"
            >
              <PlusIcon size={14} className="mr-1" />
              {t('addBtn')}
            </Button>
          </div>
        )}

        {/* Total */}
        {(orders.length > 0 || draftServices.length > 0) && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-[11px] text-slate-400">{orders.length + draftServices.length} {t('totalOrders')}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-500">{t('totalPrice')}</span>
              <span className="text-[15px] font-semibold text-blue-800">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
