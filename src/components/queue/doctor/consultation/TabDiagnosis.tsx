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
}

import { QuickSuggestions } from '../shared/ExamHelpers';

export function TabDiagnosis({ item, medicalRecord, onChange }: TabDiagnosisProps) {
  const t = useTranslations('emr.visit');
  
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">Mã ICD-10</label>
            <input 
              name="diagnosisCode"
              value={formData.diagnosisCode}
              onChange={(e) => updateField('diagnosisCode', e.target.value)}
              placeholder="VD: J00"
              className="w-full text-[13px] px-3 py-2 border border-blue-100 rounded bg-blue-50/30 focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">Chẩn đoán bệnh</label>
            <input 
              name="diagnosisName"
              value={formData.diagnosisName}
              onChange={(e) => updateField('diagnosisName', e.target.value)}
              placeholder="VD: Viêm mũi họng cấp tính"
              className="w-full text-[13px] px-3 py-2 border border-blue-100 rounded bg-blue-50/30 focus:border-blue-400 focus:outline-none transition-colors"
            />
            <QuickSuggestions 
              suggestions={['Viêm họng cấp', 'Viêm mũi dị ứng', 'Rối loạn tiêu hóa', 'Tăng huyết áp', 'ĐTĐ Typ 2', 'Suy nhược cơ thể']} 
              onSelect={(s) => updateField('diagnosisName', s)}
              currentValue={formData.diagnosisName}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">Kế hoạch điều trị</label>
          <textarea 
            name="treatmentPlan"
            value={formData.treatmentPlan}
            onChange={(e) => updateField('treatmentPlan', e.target.value)}
            placeholder="Hướng điều trị cho bệnh nhân..."
            rows={3}
            className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors resize-none"
          />
          <QuickSuggestions 
            suggestions={['Uống thuốc theo đơn', 'Nghỉ ngơi, ăn nhẹ', 'Hạn chế dầu mỡ', 'Tái khám nếu sốt cao', 'Uống nhiều nước']} 
            onSelect={(s) => updateField('treatmentPlan', (formData.treatmentPlan ? `${formData.treatmentPlan}, ${s}` : s))}
          />
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">Gợi ý / Lời dặn bỗ trợ</label>
          <textarea 
            name="doctorNotes"
            value={formData.doctorNotes}
            onChange={(e) => updateField('doctorNotes', e.target.value)}
            placeholder="Ghi chú nội bộ hoặc lời dặn dò..."
            rows={2}
            className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors resize-none"
          />
          <QuickSuggestions 
            suggestions={['Tránh thức khuya', 'Giữ ấm cổ', 'Súc họng nước muối']} 
            onSelect={(s) => updateField('doctorNotes', (formData.doctorNotes ? `${formData.doctorNotes}, ${s}` : s))}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-[13px] h-9 px-5"
          >
            {isSubmitting ? t('symptoms.saving') : t('symptoms.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
