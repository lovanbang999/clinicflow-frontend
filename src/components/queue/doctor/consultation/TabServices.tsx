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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    PENDING: { label: t('statuses.pendingPayment'), className: 'bg-amber-50 text-amber-700 border-amber-200' },
    PAID: { label: t('statuses.paid'), className: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { label: t('statuses.inProgress'), className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    COMPLETED: { label: t('statuses.completed'), className: 'bg-green-50 text-green-700 border-green-200' },
    CANCELLED: { label: t('statuses.cancelled'), className: 'bg-gray-100 text-gray-500 border-gray-200' },
  } as const;

  // Filter only services performed by specialist DOCTORs (Group 2)
  const { services: specialistServices, isLoading } = useServices({
    isActive: true,
    performedBy: 'DOCTOR',
  });

  const orders = medicalRecord?.visitServiceOrders || [];
  const dbTotalPrice = orders.reduce((sum, order) => sum + Number(order.service?.price ?? 0), 0);
  const draftTotalPrice = draftServices.reduce((sum, d) => sum + Number(d.service.price ?? 0), 0);
  const totalPrice = dbTotalPrice + draftTotalPrice;

  // Avoid duplicate services (already ordered in database or currently drafted)
  const existingServiceIds = new Set([
    ...orders.map((o) => o.serviceId),
    ...draftServices.map((d) => d.service.id)
  ]);
  const availableServices = specialistServices.filter((s) => !existingServiceIds.has(s.id));

  // Group available services by category
  const groupedServices = availableServices.reduce((acc, s) => {
    const catName = s.category?.name || t('fallbackCategory');
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(s);
    return acc;
  }, {} as Record<string, typeof specialistServices>);

  const handleAdd = () => {
    if (!selectedServiceId || isReadOnly) return;
    const serviceToAdd = specialistServices.find((s) => s.id === selectedServiceId);
    if (!serviceToAdd) return;

    // Pre-select the first eligible performing doctor if available
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
      void error;
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
          {isReadOnly && (
            <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100 px-2 py-0.5 rounded-full font-bold ml-2 border-amber-200">
              {tShared('readOnly')}
            </Badge>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">{t('group2')}</span>
        </div>

        <div className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 rounded-md p-2 mb-4">
          {t('description')}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {orders.length === 0 && draftServices.length === 0 ? (
            <div className="text-center p-4 text-[12px] text-slate-400 italic">
              {t('emptyList')}
            </div>
          ) : (
            <>
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
                      {(() => {
                        const originalService = specialistServices?.find(s => s.id === order.serviceId);
                        if (originalService?.doctorServices && originalService.doctorServices.length > 0) {
                          return (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {t('performedBy')} {originalService.doctorServices.map(ds => ds.doctorProfile.user.fullName).join(', ')}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
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

              {draftServices.map((draft) => (
                <div
                  key={draft.service.id}
                  className="flex justify-between items-center p-2.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-blue-800 truncate">{draft.service.name}</div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <UserIcon size={12} className="text-blue-500" />
                      <Select
                        value={draft.performedBy || 'unassigned'}
                        onValueChange={(val) => handleDoctorChange(draft.service.id, val === 'unassigned' ? '' : val)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="h-[28px] w-auto max-w-[200px] text-[11px] bg-white border-blue-200 text-blue-700 focus:ring-blue-400 py-1 px-2.5">
                          <SelectValue placeholder={t('selectDoctor')} />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" className="max-h-[500px]">
                          <SelectItem value="unassigned" className="text-[11px]">
                            {t('selectDoctor')}
                          </SelectItem>
                          {draft.service.doctorServices?.map((ds, idx) => {
                            const docId = ds.doctorProfile.user.id;
                            return (
                              <SelectItem key={docId || idx} value={docId} className="text-[11px]">
                                {ds.doctorProfile.user.fullName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5 rounded border bg-white text-blue-500 border-blue-200 italic">
                      {t('draft')}
                    </Badge>
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

        {!isReadOnly && (
          <div className="flex gap-2">
            <Select
              value={selectedServiceId || undefined}
              onValueChange={setSelectedServiceId}
              disabled={isLoading || isSubmitting || isReadOnly}
            >
              <SelectTrigger className="flex-1 text-[12px] bg-white h-[38px] border-gray-200">
                <SelectValue placeholder={t('placeholder')} />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="max-h-[500px]">
                {Object.entries(groupedServices).map(([categoryName, servicesList]) => (
                  <SelectGroup key={categoryName}>
                    <SelectLabel className="font-semibold text-slate-500 text-[11px] px-2 py-1 bg-slate-50 sticky top-0 uppercase tracking-wider">
                      {categoryName}
                    </SelectLabel>
                    {servicesList.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-[12px] px-4">
                        {s.name} — {(s.price ?? 0).toLocaleString('vi-VN')} đ
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
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
