'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type VisitServiceOrder } from '@/lib/api/clinical/medical-records';
import { type SpecialistFindings } from '@/lib/types/specialist-findings.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StethoscopeIcon, CheckCircleIcon, WarningIcon, PlayIcon } from '@phosphor-icons/react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ExaminationExtendedFields } from './ExaminationExtendedFields';

import { ScrollArea } from '@/components/ui/scroll-area';

interface ExaminationCenterFormProps {
  orders: VisitServiceOrder[];
  onSuccess: () => void;
}

export function ExaminationCenterForm({ orders, onSuccess }: ExaminationCenterFormProps) {
  const t = useTranslations('emr.visit.specialist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultText, setResultText] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [abnormalNote, setAbnormalNote] = useState('');
  const [findings, setFindings] = useState<SpecialistFindings>({});

  const mainOrder = orders.find(o => o.status !== 'COMPLETED') || orders[0];

  const handleStart = async () => {
    if (!mainOrder) return;
    try {
      setIsSubmitting(true);
      await medicalRecordsApi.startSpecialistExamination(mainOrder.id);
      toast.success(t('toasts.startSuccess'));
      onSuccess(); // Refresh state
    } catch (err) {
      void err;
      toast.error(t('toasts.startError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!mainOrder) {
      toast.error(t('toasts.noOrderFound'));
      return;
    }
    if (!resultText.trim()) {
      toast.error(t('toasts.emptyResultError'));
      return;
    }

    try {
      setIsSubmitting(true);
      await medicalRecordsApi.completeSpecialistExamination(mainOrder.id, {
        resultText: resultText.trim(),
        isAbnormal,
        abnormalNote: isAbnormal ? abnormalNote.trim() : undefined,
        findings, // Include structured data
      });
      toast.success(t('toasts.sentToConsultant'));
      onSuccess();
    } catch (err) {
      void err;
      toast.error(t('toasts.genericSaveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mainOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
        <StethoscopeIcon size={48} weight="thin" />
        <p>{t('noPendingServices')}</p>
      </div>
    );
  }

  const examFormType = (mainOrder.service as { examFormType?: string }).examFormType || 'GENERAL';

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative mx-auto w-full min-h-0">

      {/* Form Header */}
      <div className="bg-[#fcfdfd] px-6 py-4 border-b border-sidebar-border/50">
        <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
          <StethoscopeIcon size={20} className="text-blue-600" weight="fill" />
          {mainOrder.service.name} — {t('resultFormTitle')}
        </h2>
      </div>

      {/* Dynamic Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">
          {/* Specialty-specific fields (visual guidance) */}
          <ExaminationExtendedFields 
            examFormType={examFormType} 
            initialValue={findings}
            onChange={setFindings}
          />

          {/* Result Summary — controlled fields sent to backend */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h3 className="text-[13px] font-bold text-slate-700">{t('resultSummaryTitle')}</h3>

            <div className="space-y-2">
              <Label className="text-[12px] font-semibold text-slate-700">
                {t('resultLabel')} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={4}
                value={resultText}
                onChange={e => setResultText(e.target.value)}
                className="text-[13px] border-slate-300 min-h-[100px]"
                placeholder={t('resultPlaceholder')}
              />
            </div>

            <div className="flex items-center gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
              <Checkbox
                id="isAbnormal"
                checked={isAbnormal}
                onCheckedChange={(checked) => setIsAbnormal(checked as boolean)}
                className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
              />
              <Label htmlFor="isAbnormal" className="text-[12px] font-semibold text-amber-700 cursor-pointer">
                {t('abnormalCheckbox')}
              </Label>
            </div>

            {isAbnormal && (
              <div className="space-y-2">
                <Label className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <WarningIcon size={14} className="text-amber-500" weight="fill" />
                  {t('abnormalNoteLabel')}
                </Label>
                <Textarea
                  rows={2}
                  value={abnormalNote}
                  onChange={e => setAbnormalNote(e.target.value)}
                  className="text-[13px] border-amber-300 min-h-[60px] focus-visible:ring-amber-500"
                  placeholder={t('abnormalNotePlaceholder')}
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Sticky Footer */}
      <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-between items-center z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        <div className="text-[12px] text-slate-500">
          {t('syncNotice')}
        </div>
        <div className="flex items-center gap-3">
          {mainOrder.status === 'PAID' ? (
            <Button
              className="text-[13px] h-[36px] bg-green-600 hover:bg-green-700 shadow-sm"
              onClick={handleStart}
              disabled={isSubmitting}
            >
              <PlayIcon size={16} weight="bold" className="mr-1.5" />
              {isSubmitting ? t('starting') : t('startExamBtn')}
            </Button>
          ) : (
            <Button
              className="text-[13px] h-[36px] bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={handleComplete}
              disabled={isSubmitting || !resultText.trim()}
            >
              <CheckCircleIcon size={16} weight="bold" className="mr-1.5" />
              {isSubmitting ? t('saving') : t('finishBtn')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
