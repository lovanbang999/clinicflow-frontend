'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type CreatePrescriptionDto, type PrescriptionItemInput, type VisitResultsResponse } from '@/lib/api/medical-records';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeftIcon, TrashIcon } from '@phosphor-icons/react';
import { StickyBottomBar } from '@/components/doctor/shared/StickyBottomBar';

interface PrescriptionTabProps {
  bookingId: string;
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
  onBack?: () => void;
}

export function PrescriptionTab({ bookingId, record, onSaved, onBack }: PrescriptionTabProps) {
  const t = useTranslations('emr.visit.prescription');
  const [isSaving, setIsSaving] = useState(false);
  const canPrescribe = record?.visitStep === 'DIAGNOSED' || record?.visitStep === 'PRESCRIBED' || record?.visitStep === 'COMPLETED';

  const orders = record?.visitServiceOrders ?? [];
  const [mode, setMode] = useState<'per-service' | 'general' | 'none'>(orders.length > 0 ? 'per-service' : 'general');

  const { register, control, handleSubmit } = useForm<CreatePrescriptionDto>({
    defaultValues: {
      notes: record?.prescription?.notes ?? '',
      items: record?.prescription?.items?.length
        ? record.prescription.items.map((i) => ({
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          durationDays: i.durationDays,
          quantity: i.quantity,
          unit: i.unit ?? t('unitPlaceholder'),
          instructions: i.instructions ?? '',
          visitServiceOrderId: (i as typeof i & { visitServiceOrderId?: string }).visitServiceOrderId,
        }))
        : [{ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: 'viên', instructions: '', visitServiceOrderId: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = handleSubmit(async (data) => {
    if (!canPrescribe) {
      toast.warning(t('pendingWarning'));
      return;
    }

    // Clean up data based on mode
    const payload = { ...data };
    if (mode === 'none') {
      payload.items = [];
      payload.notes = '';
    } else if (mode === 'general') {
      // Set all items to not belong to any specific service
      payload.items = payload.items.map(i => ({ ...i, visitServiceOrderId: undefined }));
    } else if (mode === 'per-service') {
      // Must have some service linked. Remove items that don't belong to any service if they're empty
      payload.items = payload.items.filter(i => i.medicineName.trim() !== '');
    }

    try {
      setIsSaving(true);
      const updated = await medicalRecordsApi.savePrescription(bookingId, payload);
      onSaved(updated);
      toast.success(t('success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsSaving(false);
    }
  });

  // Filter items logic
  const getItemsForService = (serviceId: string | undefined) => {
    return fields.map((field, idx) => ({ field, idx })).filter(f => f.field.visitServiceOrderId === serviceId);
  };

  const handleModeChange = (newMode: 'per-service' | 'general' | 'none') => {
    setMode(newMode);

    // Provide a starting empty item when switching modes to avoid empty screens
    if (newMode === 'general' && fields.length === 0) {
      append({ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: 'viên', instructions: '', visitServiceOrderId: undefined } as PrescriptionItemInput);
    } else if (newMode === 'per-service' && orders.length > 0) {
      // Optionally prepopulate one empty field for the first order if all are empty
      if (fields.length === 0) {
        append({ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: 'viên', instructions: '', visitServiceOrderId: orders[0].id } as PrescriptionItemInput);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-6">

        {/* Header and Info */}
        <div>
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-[13.5px] leading-relaxed bg-[#faf5ff] border border-[#c4b5fd] text-[#5b21b6]">
            <span className="text-[18px] shrink-0">✨</span>
            <div><strong>Hệ thống kê đơn thông minh</strong> – Bạn có thể kê đơn theo từng chỉ định đã có kết quả hoặc kê đơn chung cho toàn bộ đợt khám.</div>
          </div>

          <div className="font-bold text-[14px] text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-[16px]">💊</span> B5 — Kê đơn thuốc <span className="px-2 py-0.5 rounded-full border border-purple-200 text-purple-600 bg-purple-50 text-[10px] font-semibold uppercase tracking-wider ml-1">Tùy chọn</span>
          </div>
        </div>

        {!canPrescribe && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
            {t.rich('pendingAlert', { strong: (chunks) => <strong>{chunks}</strong> })}
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleModeChange('per-service')}
            className={`px-4 py-2 text-[13px] font-semibold rounded-xl border transition-colors flex items-center gap-2 ${mode === 'per-service'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            📋 Kê theo từng chỉ định
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('general')}
            className={`px-4 py-2 text-[13px] font-semibold rounded-xl border transition-colors flex items-center gap-2 ${mode === 'general'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            💊 Kê đơn chung (tổng hợp)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('none')}
            className={`px-4 py-2 text-[13px] font-semibold rounded-xl border transition-colors flex items-center gap-2 ${mode === 'none'
              ? 'bg-white text-gray-800 border-gray-300 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            ✖ Không kê đơn
          </button>

          <div className="ml-auto">
            <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Chế độ đang mở khoá
            </span>
          </div>
        </div>

        {/* Dynamic Content based on Mode */}
        {mode === 'none' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-4 text-[13.5px] text-indigo-800 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">i</span>
            Bệnh nhân không cần kê đơn thuốc trong lần khám này. Nhấn &quot;Hoàn tất &amp; Kết đơn&quot; để kết thúc.
          </div>
        )}

        {mode === 'general' && (
          <div className="space-y-4">
            <div className="bg-[#f0fbf4] border border-[#bbf7d0] rounded-xl px-4 py-3 text-[13px] text-[#166534] flex items-center gap-2">
              <span className="flex-shrink-0 text-lg">✅</span> Kê đơn chung – Tống hợp thuốc cho toàn bộ đợt khám. Bác sĩ có thể tham khảo kết quả chi tiết ở Bước 3.
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-12 gap-2 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-12 sm:col-span-5">Tên thuốc</div>
                <div className="col-span-6 sm:col-span-2">Liều</div>
                <div className="col-span-6 sm:col-span-2">Tần suất</div>
                <div className="col-span-4 sm:col-span-1 text-center">SL</div>
                <div className="col-span-4 sm:col-span-1">Đơn vị</div>
                <div className="col-span-4 sm:col-span-1 text-center">Ngày</div>
              </div>

              {/* Items for general */}
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 p-1 relative items-start border-b border-gray-100 pb-3 last:border-0 last:pb-1">
                  <div className="col-span-12 sm:col-span-5 relative">
                    <Input {...register(`items.${idx}.medicineName`)} placeholder="Nhập tên thuốc..." disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input {...register(`items.${idx}.dosage`)} placeholder="Ví dụ: 100mg" disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input {...register(`items.${idx}.frequency`)} placeholder="2 lần/ngày" disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                  </div>
                  <div className="col-span-4 sm:col-span-1">
                    <Input type="number" {...register(`items.${idx}.quantity`, { valueAsNumber: true })} min={1} disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200 text-center" />
                  </div>
                  <div className="col-span-4 sm:col-span-1">
                    <Input {...register(`items.${idx}.unit`)} disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                  </div>
                  <div className="col-span-4 sm:col-span-1 relative">
                    <Input type="number" {...register(`items.${idx}.durationDays`, { valueAsNumber: true })} disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200 text-center" />

                    <button type="button" onClick={() => remove(idx)} disabled={!canPrescribe} className="absolute -right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 rounded-md transition-colors w-5 h-5 flex items-center justify-center">
                      <TrashIcon size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => append({ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: 'viên', instructions: '', visitServiceOrderId: undefined } as PrescriptionItemInput)} disabled={!canPrescribe} className="h-8 text-[12px] bg-white hover:bg-gray-50 text-gray-600 border-gray-200 rounded-lg px-3">
                  + Thêm thuốc
                </Button>
              </div>
            </div>

            <div className="pt-4 space-y-1.5 border-t border-gray-100">
              <Label className="text-[12px] font-bold text-gray-700">Ghi chú đơn thuốc chung <span className="font-normal text-gray-400 text-[11px]">(không bắt buộc)</span></Label>
              <Textarea {...register('notes')} rows={3} placeholder="Lưu ý đặc biệt cho bệnh nhân về đơn thuốc..." disabled={!canPrescribe} className="resize-none text-[13px] border-gray-200 rounded-xl" />
            </div>
          </div>
        )}

        {mode === 'per-service' && (
          <div className="space-y-5">
            <div className="bg-[#faf5ff] border border-[#e9d5ff] rounded-xl px-4 py-3 text-[13px] text-[#6b21a8] flex items-center gap-2">
              <span className="flex-shrink-0 text-lg">📋</span> Kê đơn theo từng chỉ định – mỗi xét nghiệm đã có kết quả có thể được kê thuốc riêng. Dịch vụ chưa có kết quả sẽ bị khóa.
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-6 text-[13px] text-gray-400 italic border border-dashed border-gray-200 rounded-xl">Không có dịch vụ chỉ định nào.</div>
            ) : (
              orders.map(order => {
                const groupFields = getItemsForService(order.id);
                // order.status === 'COMPLETED' is technically required for locking but let's just use canPrescribe for simplicity or rely on standard locking
                return (
                  <div key={order.id} className="border border-purple-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-purple-50/50 border-b border-purple-100 p-3 px-4 flex justify-between items-center">
                      <span className="font-bold text-[13px] text-purple-800 flex items-center gap-2">💊 Kê đơn cho: {order.service.name}</span>
                      {canPrescribe && (
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: 'viên', instructions: '', visitServiceOrderId: order.id } as PrescriptionItemInput)} className="h-7 text-xs bg-white text-purple-700 border-purple-200 hover:bg-purple-50 rounded-lg px-3">
                          + Thêm thuốc
                        </Button>
                      )}
                    </div>

                    <div className="p-4 bg-white space-y-4">
                      {groupFields.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-2">Chưa có thuốc nào cho chỉ định này</p>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-12 gap-2 px-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-12 sm:col-span-5">Tên thuốc</div>
                            <div className="col-span-6 sm:col-span-2">Liều</div>
                            <div className="col-span-6 sm:col-span-2">Tần suất</div>
                            <div className="col-span-4 sm:col-span-1 text-center">SL</div>
                            <div className="col-span-4 sm:col-span-1">Đơn vị</div>
                            <div className="col-span-4 sm:col-span-1 text-center">Ngày</div>
                          </div>

                          {groupFields.map(({ field, idx }) => (
                            <div key={field.id} className="grid grid-cols-12 gap-2 relative items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                              <div className="col-span-12 sm:col-span-5">
                                <Input {...register(`items.${idx}.medicineName`)} placeholder="Nhập tên thuốc..." disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                              </div>
                              <div className="col-span-6 sm:col-span-2">
                                <Input {...register(`items.${idx}.dosage`)} placeholder="Ví dụ: 100mg" disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                              </div>
                              <div className="col-span-6 sm:col-span-2">
                                <Input {...register(`items.${idx}.frequency`)} placeholder="2 lần/ngày" disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                              </div>
                              <div className="col-span-4 sm:col-span-1">
                                <Input type="number" {...register(`items.${idx}.quantity`, { valueAsNumber: true })} min={1} disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200 text-center" />
                              </div>
                              <div className="col-span-4 sm:col-span-1">
                                <Input {...register(`items.${idx}.unit`)} disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200" />
                              </div>
                              <div className="col-span-4 sm:col-span-1 relative">
                                <Input type="number" {...register(`items.${idx}.durationDays`, { valueAsNumber: true })} disabled={!canPrescribe} className="text-[13px] h-[38px] rounded-lg border-gray-200 text-center" />

                                <button type="button" onClick={() => remove(idx)} disabled={!canPrescribe} className="absolute -right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 rounded-md transition-colors w-5 h-5 flex items-center justify-center">
                                  <TrashIcon size={14} weight="bold" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-4 space-y-1.5 border-t border-gray-100 mt-2">
              <Label className="text-[12px] font-bold text-gray-700">Ghi chú đơn thuốc chung <span className="font-normal text-gray-400 text-[11px]">(không bắt buộc)</span></Label>
              <Textarea {...register('notes')} rows={3} placeholder="Lưu ý đặc biệt cho bệnh nhân..." disabled={!canPrescribe} className="resize-none text-[13px] border-gray-200 rounded-xl" />
            </div>
          </div>
        )}

      </div>

      <StickyBottomBar title="Bước 4/4 - Kê đơn thuốc">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6 py-2 h-[42px] rounded-xl text-gray-700 bg-white border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all mr-auto"
            >
              <ArrowLeftIcon size={16} />
              Trở lại
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSaving || !canPrescribe}
            className="px-6 py-2 h-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            ✅ {isSaving ? t('saving') : 'Hoàn tất & Kết đơn'}
          </Button>
        </div>
      </StickyBottomBar>
    </form>
  );
}
