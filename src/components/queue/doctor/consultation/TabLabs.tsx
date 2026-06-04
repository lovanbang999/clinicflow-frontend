'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { labOrdersApi } from '@/lib/api/clinical/lab-orders';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { useTechnicians } from '@/lib/hooks/clinical/useTechnicians';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TrashIcon, PlusIcon, FlaskIcon } from '@phosphor-icons/react';
import { LabResultContent } from '@/components/shared/LabResultContent';
import { useTranslations } from 'next-intl';
import type { Service } from '@/types/service';
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
import type { DraftLabOrder } from './ConsultationContext';

interface TabLabsProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  draftLabs: DraftLabOrder[];
  setDraftLabs: (val: DraftLabOrder[]) => void;
  onChange: () => void;
  isReadOnly?: boolean;
}

/** Component for rendering individual draft lab items with technician selector */
function DraftLabItem({
  draft,
  onTechnicianChange,
  onRemove,
  isReadOnly,
  t,
}: {
  draft: DraftLabOrder;
  onTechnicianChange: (serviceId: string, technicianId: string, technicianName: string) => void;
  onRemove: () => void;
  isReadOnly?: boolean;
  t: (key: string) => string;
}) {
  const { technicians, isLoading } = useTechnicians(draft.service.categoryId ?? undefined);

  return (
    <div className="flex justify-between items-start p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 animate-in fade-in duration-200">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-amber-800 truncate">{draft.service.name}</div>
        
        {/* Dropdown to select technician */}
        <div className="mt-1.5">
          <Select
            value={draft.assignedTechnicianId || 'unassigned'}
            onValueChange={(val) => {
              const tech = technicians.find((t) => t.id === val);
              onTechnicianChange(draft.service.id, val === 'unassigned' ? '' : val, tech?.fullName || '');
            }}
            disabled={isReadOnly}
          >
            <SelectTrigger className="h-[28px] w-auto min-w-[130px] max-w-[220px] text-[11px] bg-white border-amber-200 text-amber-800 focus:ring-amber-400 py-1 px-2.5 rounded-lg">
              <SelectValue placeholder="Tự động phân công" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" className="max-h-[300px]">
              <SelectItem value="unassigned" className="text-[11px]">
                Tự động phân công
              </SelectItem>
              {isLoading ? (
                <div className="p-2 text-center text-[11px] text-gray-400">Đang tải...</div>
              ) : technicians.length === 0 ? (
                <div className="p-2 text-center text-[11px] text-gray-400 italic">Không có KTV chuyên môn</div>
              ) : (
                technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id} className="text-[11px]">
                    {tech.fullName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5 rounded border bg-white text-amber-600 border-amber-200 italic">
          {t('draft')}
        </Badge>
        <span className="text-[12px] font-semibold text-slate-700 min-w-[60px] text-right">
          {draft.service.price !== null ? `${Number(draft.service.price).toLocaleString('vi-VN')} đ` : '—'}
        </span>
        {!isReadOnly && (
          <button
            onClick={onRemove}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
            title={t('discard')}
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export function TabLabs({ medicalRecord, draftLabs, setDraftLabs, onChange, isReadOnly }: TabLabsProps) {
  const tl = useTranslations('emr.lab');
  const tShared = useTranslations('emr.visit.shared');

  const STATUS_CONFIG = {
    PENDING: { label: tl('status.pending'), className: 'bg-amber-50 text-amber-700 border-amber-200' },
    PAID: { label: tl('status.paid'), className: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { label: tl('status.inProgress'), className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    COMPLETED: { label: tl('status.completed'), className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    CANCELLED: { label: tl('status.cancelled'), className: 'bg-gray-100 text-gray-500 border-gray-200' },
  } as const;

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only services performed by lab technicians (Group 1)
  const { services: labServices, isLoading } = useServices({
    isActive: true,
    performedBy: 'TECHNICIAN',
  });

  const labs = medicalRecord?.labOrders || [];

  // Safely look up service price by ID
  const getPriceByServiceId = (serviceId: string | undefined) => {
    if (!serviceId) return null;
    return labServices.find((s) => s.id === serviceId)?.price ?? null;
  };

  const dbTotalPrice = labs.reduce((sum, lab) => {
    const price = getPriceByServiceId(lab.serviceId);
    return sum + Number(price ?? 0);
  }, 0);

  const draftTotalPrice = draftLabs.reduce((sum, lab) => sum + Number(lab.service.price ?? 0), 0);
  const totalPrice = dbTotalPrice + draftTotalPrice;

  // Avoid duplicate services (already ordered in database or currently drafted)
  const existingServiceIds = new Set([
    ...labs.map((l) => l.serviceId).filter(Boolean),
    ...draftLabs.map((l) => l.service.id)
  ]);
  const availableServices = labServices.filter((s) => !existingServiceIds.has(s.id));

  // Group available services by category
  const groupedServices = availableServices.reduce((acc, s) => {
    const catName = s.category?.name || tl('fallbackCategory');
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  const handleAdd = () => {
    if (!selectedServiceId || isReadOnly) return;
    const selectedSrv = labServices.find((s) => s.id === selectedServiceId);
    if (!selectedSrv) return;

    setDraftLabs([
      ...draftLabs,
      {
        service: selectedSrv,
        assignedTechnicianId: undefined,
        assignedTechnicianName: undefined,
      },
    ]);
    setSelectedServiceId('');
  };

  const handleTechnicianChange = (serviceId: string, technicianId: string, technicianName: string) => {
    if (isReadOnly) return;
    setDraftLabs(
      draftLabs.map((d) =>
        d.service.id === serviceId
          ? {
              ...d,
              assignedTechnicianId: technicianId || undefined,
              assignedTechnicianName: technicianName || undefined,
            }
          : d
      )
    );
  };

  const handleRemove = async (orderId: string) => {
    if (isReadOnly) return;
    try {
      setIsSubmitting(true);
      await labOrdersApi.deleteOrder(orderId);
      toast.success(tl('toasts.deleteSuccess'));
      onChange();
    } catch (error) {
      void error;
      toast.error(tl('toasts.deleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskIcon size={14} className="text-amber-600" />
          <div className="text-[13px] font-medium text-slate-800">{tl('listTitleShort')}</div>
          {isReadOnly && (
            <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100 px-2 py-0.5 rounded-full font-bold ml-2 border-amber-200">
              {tShared('readOnly')}
            </Badge>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">{tl('group1')}</span>
        </div>

        <div className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 rounded-md p-2 mb-4">
          {tl('paymentReminder')}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {labs.length === 0 && draftLabs.length === 0 ? (
            <div className="text-center p-4 text-[12px] text-slate-400 italic">
              {tl('emptyList')}
            </div>
          ) : (
            <>
              {labs.map((lab) => {
                const statusCfg = STATUS_CONFIG[lab.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                const price = getPriceByServiceId(lab.serviceId);
                const isCompleted = lab.status === 'COMPLETED';
                const isAbnormal = lab.result?.isAbnormal;

                return (
                  <div
                    key={lab.id}
                    className={`flex justify-between items-start p-2.5 rounded-lg border transition-all duration-200 ${isAbnormal
                      ? 'bg-amber-50/50 border-amber-200'
                      : isCompleted
                        ? 'bg-cyan-50/40 border-cyan-100'
                        : 'bg-slate-50/50 border-slate-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-slate-800 truncate">{lab.testName}</div>
                      {isCompleted && lab.result?.resultText && (
                        <div className="mt-2">
                          <LabResultContent
                            text={lab.result.resultText}
                            imageUrls={lab.result.resultFileUrl ? [lab.result.resultFileUrl] : []}
                            className="!p-2 !bg-white/50"
                          />
                        </div>
                      )}
                      
                      {/* Show performing technician if assigned */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        {lab.assignedTechnician ? (
                          <span className="text-blue-700 font-medium bg-blue-50/60 border border-blue-100 px-1.5 py-0.5 rounded">
                            KTV: {lab.assignedTechnician.fullName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                            Tự động phân công
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
                      <span className="text-[12px] font-semibold text-slate-700 min-w-[60px] text-right">
                        {price !== null ? `${price.toLocaleString('vi-VN')} đ` : '—'}
                      </span>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemove(lab.id)}
                          disabled={isSubmitting || lab.status !== 'PENDING'}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={lab.status !== 'PENDING' ? tl('cantDelete') : tl('deleteAction')}
                        >
                          <TrashIcon size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {draftLabs.map((draft) => (
                <DraftLabItem
                  key={draft.service.id}
                  draft={draft}
                  onTechnicianChange={handleTechnicianChange}
                  onRemove={() => setDraftLabs(draftLabs.filter(l => l.service.id !== draft.service.id))}
                  isReadOnly={isReadOnly}
                  t={tl}
                />
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
                <SelectValue placeholder={tl('selectService')} />
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
              {tl('add')}
            </Button>
          </div>
        )}

        {(labs.length > 0 || draftLabs.length > 0) && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-[11px] text-slate-400">{labs.length + draftLabs.length} {tl('countUnit')}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-500">{tl('totalFee')}</span>
              <span className="text-[15px] font-semibold text-blue-800">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
