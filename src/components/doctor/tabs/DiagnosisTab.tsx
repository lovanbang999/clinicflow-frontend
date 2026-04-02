'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type SaveDiagnosisDto, type VisitResultsResponse } from '@/lib/api/medical-records';
import { ServiceOrderCard } from '@/components/doctor/shared/ServiceOrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ClockIcon } from '@phosphor-icons/react';

interface DiagnosisTabProps {
  bookingId: string;
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
}

export function DiagnosisTab({ bookingId, record, onSaved }: DiagnosisTabProps) {
  const t = useTranslations('emr.visit.diagnosis');
  const [isSaving, setIsSaving] = useState(false);
  const [icdResults, setIcdResults] = useState<{code: string; name: string}[]>([]);
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, setValue, watch } = useForm<SaveDiagnosisDto>({
    defaultValues: {
      diagnosisCode: record?.diagnosisCode ?? '',
      diagnosisName: record?.diagnosisName ?? '',
      treatmentPlan: record?.treatmentPlan ?? '',
      doctorNotes: record?.doctorNotes ?? '',
      followUpDate: record?.followUpDate
        ? new Date(record.followUpDate).toISOString().split('T')[0]
        : '',
      followUpNote: record?.followUpNote ?? '',
    },
  });

  const orders = record?.visitServiceOrders ?? [];
  const allDone = orders.length > 0 && orders.every((o) => o.status === 'COMPLETED');
  const pendingCount = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;

  const canDiagnose = orders.length === 0 || allDone;

  const currentIcdCode = watch('diagnosisCode');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Avoid fetching if the dropdown was just closed by a selection
      if (currentIcdCode && currentIcdCode.length >= 2) {
        try {
          const res = await medicalRecordsApi.searchICD10(currentIcdCode);
          setIcdResults(res);
          setShowIcdDropdown(true);
        } catch {
          // silent error
        }
      } else {
        setShowIcdDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [currentIcdCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowIcdDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectIcd = (code: string, name: string) => {
    setValue('diagnosisCode', code, { shouldDirty: true, shouldValidate: true });
    setValue('diagnosisName', name, { shouldDirty: true, shouldValidate: true });
    setShowIcdDropdown(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!canDiagnose) {
      toast.warning(t('pendingWarning', { count: pendingCount }));
      return;
    }
    try {
      setIsSaving(true);
      const payload = { ...data };
      if (!payload.followUpDate) delete payload.followUpDate;

      const updated = await medicalRecordsApi.saveDiagnosis(bookingId, payload);
      onSaved(updated);
      toast.success(t('success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <div className="space-y-5">
      {/* KTV Results */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
            {t('headerKtv')}
            {!allDone && (
              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ClockIcon size={12} />
                {pendingCount} {t('pendingBadge')}
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {orders.map((order) => (
              <ServiceOrderCard key={order.id} order={order} showResult />
            ))}
          </div>
        </div>
      )}

      {/* Diagnosis Form */}
      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="text-[15px] font-bold text-gray-800">{t('headerForm')}</h3>

        {!canDiagnose && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
            {t.rich('pendingAlert', {
              count: pendingCount,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <Label className="text-[13px] font-semibold">{t('icdCode')}</Label>
            <Input
              {...register('diagnosisCode')}
              placeholder={t('icdPlaceholder')}
              disabled={!canDiagnose}
              className="text-[14px]"
              autoComplete="off"
              onFocus={() => { if (icdResults.length > 0) setShowIcdDropdown(true); }}
            />
            {showIcdDropdown && icdResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50 max-h-60 overflow-y-auto">
                {icdResults.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">Không tìm thấy mã</div>
                ) : (
                  icdResults.map(r => (
                    <div
                      key={r.code}
                      className="px-3 py-2.5 text-[13px] hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      onClick={() => selectIcd(r.code, r.name)}
                    >
                      <span className="font-bold text-blue-700">{r.code}</span> - <span className="text-gray-700">{r.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-[13px] font-semibold">{t('diagnosis')}</Label>
            <Input
              {...register('diagnosisName')}
              placeholder={t('diagnosisPlaceholder')}
              disabled={!canDiagnose}
              className="text-[14px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px] font-semibold">{t('treatment')}</Label>
          <Textarea
            {...register('treatmentPlan')}
            rows={3}
            placeholder={t('treatmentPlaceholder')}
            disabled={!canDiagnose}
            className="resize-none text-[14px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold">{t('followUpDate')}</Label>
            <Input
              type="date"
              {...register('followUpDate')}
              disabled={!canDiagnose}
              className="text-[14px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold">{t('followUpNote')}</Label>
            <Input
              {...register('followUpNote')}
              placeholder={t('followUpNotePlaceholder')}
              disabled={!canDiagnose}
              className="text-[14px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={isSaving || !canDiagnose}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
          >
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
