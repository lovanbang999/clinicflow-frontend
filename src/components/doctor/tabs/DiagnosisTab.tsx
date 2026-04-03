'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { type SaveDiagnosisDto, type VisitResultsResponse } from '@/lib/api/medical-records';
import { useSaveDiagnosis, useIcd10Search } from '@/lib/hooks/useMedicalRecords';
import { ServiceOrderCard } from '@/components/doctor/shared/ServiceOrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '@phosphor-icons/react';
import { StickyBottomBar } from '@/components/doctor/shared/StickyBottomBar';

interface DiagnosisTabProps {
  bookingId: string;
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
  onBack?: () => void;
}

export function DiagnosisTab({ bookingId, record, onSaved, onBack }: DiagnosisTabProps) {
  const t = useTranslations('emr.visit.diagnosis');
  const { saveDiagnosis, isSaving } = useSaveDiagnosis();
  const { results: icdResults, search: searchIcd } = useIcd10Search();
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<SaveDiagnosisDto>({
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

  const orders = record?.labOrders ?? [];
  const allDone = orders.length > 0 && orders.every((o) => o.status === 'COMPLETED');
  const pendingCount = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;

  const canDiagnose = orders.length === 0 || allDone;

  const currentIcdCode = useWatch({ control, name: 'diagnosisCode' });
  const currentIcdName = useWatch({ control, name: 'diagnosisName' });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (currentIcdCode && currentIcdCode.length >= 2) {
        await searchIcd(currentIcdCode);
        setShowIcdDropdown(true);
      } else {
        setShowIcdDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [currentIcdCode, searchIcd]);

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

    const payload = { ...data };
    if (!payload.followUpDate) delete payload.followUpDate;

    const updated = await saveDiagnosis(bookingId, payload);
    if (updated) {
      onSaved(updated);
      toast.success(t('success'));
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
            {orders.map((order: any) => (
              <ServiceOrderCard 
                key={order.id} 
                order={{
                  ...order,
                  medicalRecordId: '',
                  serviceId: '',
                  patientProfileId: '',
                  orderedBy: '',
                  createdAt: new Date().toISOString(),
                  service: { id: order.id, name: order.testName },
                  resultText: order.result?.resultText,
                  isAbnormal: order.result?.isAbnormal,
                  abnormalNote: order.result?.abnormalNote,
                  resultFileUrl: order.result?.resultFileUrl
                }} 
                showResult 
              />
            ))}
          </div>
        </div>
      )}

      {/* Diagnosis Form */}
      <form onSubmit={onSubmit} className="relative">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="font-bold text-[14px] text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <span className="text-[16px]">🔬</span> {t('headerForm')}
          </div>

          {!canDiagnose && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700 flex gap-3 items-start">
              <span className="text-lg leading-none">⏳</span>
              <div>
                {t.rich('pendingAlert', {
                  count: pendingCount,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <Label className="text-[13px] font-semibold text-slate-700">{t('icdCode')} <span className="text-red-500">*</span></Label>
              <Input
                {...register('diagnosisCode', { required: true })}
                placeholder={t('icdPlaceholder')}
                disabled={!canDiagnose}
                className={`text-[14px] bg-white border-gray-200 shadow-none border-[1.5px] rounded-lg h-[42px] ${errors.diagnosisCode ? 'border-red-500 bg-red-50' : ''}`}
                autoComplete="off"
                onFocus={() => { if (icdResults.length > 0) setShowIcdDropdown(true); }}
              />
              { errors.diagnosisCode && <p className="text-[10px] text-red-500 font-medium mt-1">{t('requiredCode')}</p> }

              {currentIcdCode && currentIcdName && !showIcdDropdown && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 mt-2.5 flex items-center gap-2.5">
                  <span className="font-mono text-[13px] font-bold text-indigo-700">{currentIcdCode}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-[12.5px] text-gray-800">{currentIcdName}</span>
                </div>
              )}

              {showIcdDropdown && icdResults.length > 0 && (
                <div className="absolute top-14 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50 max-h-60 overflow-y-auto">
                  {icdResults.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-gray-500 text-center">{t('noCodeFound')}</div>
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

            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-slate-700">{t('diagnosis')} <span className="text-red-500">*</span></Label>
              <Input
                {...register('diagnosisName', { required: true })}
                placeholder={t('diagnosisPlaceholder')}
                disabled={!canDiagnose}
                className={`text-[14px] bg-white border-gray-200 shadow-none border-[1.5px] rounded-lg h-[42px] ${errors.diagnosisName ? 'border-red-500 bg-red-50' : ''}`}
              />
              { errors.diagnosisName && <p className="text-[10px] text-red-500 font-medium mt-1">{t('requiredName')}</p> }
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-slate-700">{t('treatment')} <span className="text-[11px] font-normal text-gray-400 select-none ml-1">{t('optional')}</span></Label>
              <Textarea
                {...register('treatmentPlan')}
                rows={3}
                placeholder={t('treatmentPlaceholder')}
                disabled={!canDiagnose}
                className="resize-none text-[14px] bg-white border-gray-200 shadow-none border-[1.5px] rounded-lg min-h-[90px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">{t('followUpDate')}</Label>
                <Input
                  type="date"
                  {...register('followUpDate')}
                  disabled={!canDiagnose}
                  className="text-[14px] bg-white border-gray-200 shadow-none border-[1.5px] rounded-lg h-[42px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">{t('followUpNote')} <span className="text-[11px] font-normal text-gray-400 select-none ml-1">{t('optional')}</span></Label>
                <Input
                  {...register('followUpNote')}
                  placeholder={t('followUpNotePlaceholder')}
                  disabled={!canDiagnose}
                  className="text-[14px] bg-white border-gray-200 shadow-none border-[1.5px] rounded-lg h-[42px]"
                />
              </div>
            </div>
          </div>
        </div>

        <StickyBottomBar title={t('stickyTitle')}>
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="px-6 py-2 h-[42px] rounded-xl text-gray-700 bg-white border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all mr-auto"
              >
                <ArrowLeftIcon size={16} />
                {t('back')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSaving || !canDiagnose}
              className="px-6 py-2 h-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? t('saving') : <>
                {t('saveAndNext')}
                <ArrowRightIcon size={16} />
              </>}
            </Button>
          </div>
        </StickyBottomBar>
      </form>
    </div>
  );
}
