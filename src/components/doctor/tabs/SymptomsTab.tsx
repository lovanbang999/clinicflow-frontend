'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type SaveSymptomsDto, type VisitResultsResponse } from '@/lib/api/medical-records';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SymptomsTabProps {
  bookingId: string;
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
}

export function SymptomsTab({ bookingId, record, onSaved }: SymptomsTabProps) {
  const t = useTranslations('dashboard.doctor.workspace.visit.symptoms');
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit } = useForm<SaveSymptomsDto>({
    defaultValues: {
      chiefComplaint: record?.chiefComplaint ?? '',
      clinicalFindings: record?.clinicalFindings ?? '',
      doctorNotes: record?.doctorNotes ?? '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSaving(true);
      const updated = await medicalRecordsApi.saveSymptoms(bookingId, data);
      onSaved(updated);
      toast.success(t('success'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('error');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 shadow-sm">
        <h3 className="text-[15px] font-bold text-gray-800">{t('header')}</h3>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-gray-700">
            {t('chiefComplaint')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            {...register('chiefComplaint')}
            rows={3}
            placeholder={t('chiefComplaintPlaceholder')}
            className="resize-none text-[14px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-gray-700">
            {t('clinicalFindings')}
          </Label>
          <Textarea
            {...register('clinicalFindings')}
            rows={4}
            placeholder={t('clinicalFindingsPlaceholder')}
            className="resize-none text-[14px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] font-semibold text-gray-700">{t('doctorNotes')}</Label>
          <Textarea
            {...register('doctorNotes')}
            rows={2}
            placeholder={t('doctorNotesPlaceholder')}
            className="resize-none text-[14px]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="px-8 bg-blue-600 hover:bg-blue-700 text-white">
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
}
