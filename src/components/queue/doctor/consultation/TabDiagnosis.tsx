'use client';

import { useState, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface TabDiagnosisProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
  isReadOnly?: boolean;
}

import { QuickSuggestions } from '../shared/ExamHelpers';
import { ICD10Autocomplete } from '../shared/ICD10Autocomplete';

export function TabDiagnosis({ item, medicalRecord, onChange, isReadOnly }: TabDiagnosisProps) {
  const t = useTranslations('emr.visit');
  const tShared = useTranslations('emr.visit.shared');
  
  const [formData, setFormData] = useState({
    diagnosisCode: '',
    diagnosisName: '',
    treatmentPlan: '',
    doctorNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicalRecord) {
      setFormData({
        diagnosisCode: medicalRecord.diagnosisCode || '',
        diagnosisName: medicalRecord.diagnosisName || '',
        treatmentPlan: medicalRecord.treatmentPlan || '',
        doctorNotes: medicalRecord.doctorNotes || '',
      });
    }
  }, [medicalRecord]);

  const updateField = (field: string, value: string) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    try {
      setIsSubmitting(true);
      await medicalRecordsApi.saveDiagnosis(item.bookingId, formData);
      toast.success(t('messages.saveSuccess'));
      onChange();
    } catch (error) {
      console.error(error);
      toast.error(t('messages.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <div className="text-[13px] font-medium text-slate-800">{t('tabs.diagnosis')}</div>
            {isReadOnly && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2">{tShared('readOnly')}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">{t('diagnosis.icdCode')}</label>
            <ICD10Autocomplete 
              value={formData.diagnosisCode}
              onChange={(val) => updateField('diagnosisCode', val)}
              onSelect={(item) => {
                updateField('diagnosisCode', item.code);
                updateField('diagnosisName', item.name);
              }}
              placeholder={t('diagnosis.icdPlaceholder')}
              className="w-full text-[13px] px-3 py-2 border border-blue-100 rounded bg-blue-50/30 focus:border-blue-400 focus:outline-none transition-colors disabled:opacity-70 disabled:bg-slate-50"
              disabled={isReadOnly}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">{t('diagnosis.diagnosis')}</label>
            <input 
              name="diagnosisName"
              value={formData.diagnosisName}
              onChange={(e) => updateField('diagnosisName', e.target.value)}
              placeholder={t('diagnosis.diagnosisPlaceholder')}
              className="w-full text-[13px] px-3 py-2 border border-blue-100 rounded bg-blue-50/30 focus:border-blue-400 focus:outline-none transition-colors disabled:opacity-70 disabled:bg-slate-50"
              disabled={isReadOnly}
            />
            {!isReadOnly && (
              <QuickSuggestions 
                suggestions={t.raw('diagnosis.suggestions.diagnosis')} 
                onSelect={(s) => updateField('diagnosisName', s)}
                currentValue={formData.diagnosisName}
              />
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">{t('diagnosis.treatment')}</label>
          <textarea 
            name="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={(e) => updateField('treatmentPlan', e.target.value)}
            placeholder={t('diagnosis.treatmentPlaceholder')}
            rows={3}
            className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors resize-none disabled:opacity-70 disabled:bg-slate-50"
            disabled={isReadOnly}
          />
          {!isReadOnly && (
            <QuickSuggestions 
              suggestions={t.raw('diagnosis.suggestions.treatment')} 
              onSelect={(s) => updateField('treatmentPlan', (formData.treatmentPlan ? `${formData.treatmentPlan}, ${s}` : s))}
            />
          )}
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">{t('diagnosis.doctorAdvice')}</label>
          <textarea 
            name="doctorNotes"
            value={formData.doctorNotes}
            onChange={(e) => updateField('doctorNotes', e.target.value)}
            placeholder={t('diagnosis.advicePlaceholder')}
            rows={2}
            className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors resize-none disabled:opacity-70 disabled:bg-slate-50"
            disabled={isReadOnly}
          />
          {!isReadOnly && (
            <QuickSuggestions 
              suggestions={t.raw('diagnosis.suggestions.advice')} 
              onSelect={(s) => updateField('doctorNotes', (formData.doctorNotes ? `${formData.doctorNotes}, ${s}` : s))}
            />
          )}
        </div>

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-[13px] h-9 px-5"
            >
              {isSubmitting ? t('diagnosis.saving') : t('diagnosis.save')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
