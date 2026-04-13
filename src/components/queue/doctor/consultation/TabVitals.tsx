'use client';

import { useState, useEffect, useRef } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse, type SaveSymptomsDto } from '@/lib/api/clinical/medical-records';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface TabVitalsProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
}

export function TabVitals({ item, medicalRecord, onChange }: TabVitalsProps) {
  const t = useTranslations('emr.visit');
  const [formData, setFormData] = useState<SaveSymptomsDto>({});

  const isDirtyRef = useRef(false);
  const [prevRecord, setPrevRecord] = useState(medicalRecord);

  // Derive state from props during render phase to avoid cascading updates in effect
  if (medicalRecord !== prevRecord) {
    setPrevRecord(medicalRecord);
    if (medicalRecord) {
      setFormData({
        bloodPressure: medicalRecord.bloodPressure || '',
        heartRate: medicalRecord.heartRate || undefined,
        temperature: medicalRecord.temperature || undefined,
        spO2: medicalRecord.spO2 || undefined,
        weightKg: medicalRecord.weightKg || undefined,
        heightCm: medicalRecord.heightCm || undefined,
        chiefComplaint: medicalRecord.chiefComplaint || '',
        additionalSymptoms: medicalRecord.additionalSymptoms || '',
        clinicalFindings: medicalRecord.clinicalFindings || '',
      });
    } else if (item.booking.patientProfile) {
       setFormData(prev => ({
         ...prev,
         weightKg: item.booking.patientProfile?.weightKg || undefined,
         heightCm: item.booking.patientProfile?.heightCm || undefined,
       }));
    }
  }

  // Isolated effect just to clear the ref safely after render
  useEffect(() => {
    isDirtyRef.current = false;
  }, [medicalRecord]);

  const handleChange = (field: keyof SaveSymptomsDto, value: string | number | undefined) => {
    isDirtyRef.current = true;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isDirtyRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const finalData = { ...formData };
        if (finalData.weightKg && finalData.heightCm) {
          const heightM = finalData.heightCm / 100;
          finalData.bmi = parseFloat((finalData.weightKg / (heightM * heightM)).toFixed(1));
        }

        await medicalRecordsApi.saveSymptoms(item.bookingId, finalData);
        // Do not spam toast success on auto-save
        // toast.success(t('messages.saveSuccess')); 
        isDirtyRef.current = false;
        onChange(); 
      } catch (error) {
        console.error(error);
        toast.error(t('messages.saveError'));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, item.bookingId, onChange, t]);

  // Safe parsed values used for UI logic (like abnormal highlight)
  const bpParts = formData.bloodPressure?.split('/') || [];
  const sys = parseInt(bpParts[0]) || 0;
  const dia = parseInt(bpParts[1]) || 0;
  
  const isAbnormalBp = (sys > 0 && (sys > 140 || sys < 90)) || (dia > 0 && dia > 90);
  const isAbnormalHr = formData.heartRate && (formData.heartRate > 100 || formData.heartRate < 50);
  const isAbnormalTemp = formData.temperature && (formData.temperature > 37.5 || formData.temperature < 36);
  const isAbnormalSpo2 = formData.spO2 && formData.spO2 < 95;

  let bmiSpan = '—';
  let bmiCat = '';
  let isAbnormalBmi = false;
  if (formData.weightKg && formData.heightCm) {
    const h = formData.heightCm / 100;
    const bmi = formData.weightKg / (h * h);
    bmiSpan = bmi.toFixed(1);
    if (bmi < 18.5) { bmiCat = t('symptoms.bmi.underweight'); isAbnormalBmi = true; }
    else if (bmi < 23) bmiCat = t('symptoms.bmi.normal');
    else if (bmi < 25) { bmiCat = t('symptoms.bmi.overweight'); isAbnormalBmi = true; }
    else { bmiCat = t('symptoms.bmi.obese'); isAbnormalBmi = true; }
  }

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Vitals Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* BP */}
        <div className={`col-span-2 bg-white border rounded-lg p-3 ${isAbnormalBp ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <div className="text-[11px] mb-1.5 text-slate-500">{t('symptoms.bp')}</div>
          <div className="flex items-center gap-1.5">
            <input 
              className="border-none bg-transparent text-[16px] font-medium w-full focus:outline-none" 
              placeholder="120/80" 
              value={formData.bloodPressure || ''}
              onChange={(e) => handleChange('bloodPressure', e.target.value)}

            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">mmHg</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className={`bg-white border rounded-lg p-3 ${isAbnormalHr ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <div className="text-[11px] mb-1.5 text-slate-500">{t('symptoms.heartRate')}</div>
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              placeholder="80" 
              className="border-none bg-transparent text-[16px] font-medium w-full focus:outline-none" 
              value={formData.heartRate || ''}
              onChange={(e) => handleChange('heartRate', e.target.value ? parseFloat(e.target.value) : undefined)}

            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{t('symptoms.heartRateUnit')}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className={`bg-white border rounded-lg p-3 ${isAbnormalTemp ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <div className="text-[11px] mb-1.5 text-slate-500">{t('symptoms.temperature')}</div>
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              placeholder="37" 
              step="0.1"
              className="border-none bg-transparent text-[16px] font-medium w-full focus:outline-none" 
              value={formData.temperature || ''}
              onChange={(e) => handleChange('temperature', e.target.value ? parseFloat(e.target.value) : undefined)}

            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{t('symptoms.temperatureUnit')}</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className={`bg-white border rounded-lg p-3 ${isAbnormalSpo2 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <div className={`text-[11px] mb-1.5 ${isAbnormalSpo2 ? 'text-red-600' : 'text-slate-500'}`}>SpO₂</div>
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              placeholder="98" 
              className="border-none bg-transparent text-[16px] font-medium w-full focus:outline-none" 
              value={formData.spO2 || ''}
              onChange={(e) => handleChange('spO2', e.target.value ? parseFloat(e.target.value) : undefined)}

            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">%</span>
          </div>
        </div>

        {/* Weight */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-[11px] mb-1.5 text-slate-500">{t('symptoms.weight')}</div>
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              placeholder="55" 
              className="border-none bg-transparent text-[16px] font-medium w-full focus:outline-none" 
              value={formData.weightKg || ''}
              onChange={(e) => handleChange('weightKg', e.target.value ? parseFloat(e.target.value) : undefined)}

            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{t('symptoms.weightUnit')}</span>
          </div>
        </div>

        {/* Height */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-[11px] mb-1.5 text-slate-500">{t('symptoms.height')}</div>
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              placeholder="160" 
              className="border-none bg-transparent text-[16px] font-medium w-full focus:outline-none" 
              value={formData.heightCm || ''}
              onChange={(e) => handleChange('heightCm', e.target.value ? parseFloat(e.target.value) : undefined)}

            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{t('symptoms.heightUnit')}</span>
          </div>
        </div>

        {/* BMI */}
        <div className={`col-span-2 bg-white border rounded-lg p-3 flex justify-between items-center ${isAbnormalBmi ? 'bg-amber-50 border-amber-200' : 'border-gray-200'}`}>
          <div className="text-[11px] text-slate-500">BMI</div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-slate-900">{bmiSpan}</span>
            <span className="text-[11px] font-medium bg-white/50 px-2 py-0.5 rounded border border-black/5">{bmiCat || '—'}</span>
          </div>
        </div>
      </div>

      {/* Symptoms Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">{t('symptoms.header')}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">{t('symptoms.chiefComplaint')}</label>
            <textarea 
              className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[60px]"
              placeholder={t('symptoms.chiefComplaintPlaceholder')}
              value={formData.chiefComplaint || ''}
              onChange={(e) => handleChange('chiefComplaint', e.target.value)}

            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">{t('symptoms.additionalSymptoms')}</label>
            <textarea 
              className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[60px]"
              placeholder={t('symptoms.additionalSymptomsPlaceholder')}
              value={formData.additionalSymptoms || ''}
              onChange={(e) => handleChange('additionalSymptoms', e.target.value)}

            />
          </div>
        </div>
      </div>

      {/* Clinical Findings Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">{t('symptoms.clinicalFindings')}</div>
        </div>
        <div>
          <textarea 
            className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[80px]"
            placeholder={t('symptoms.clinicalFindingsPlaceholder')}
            value={formData.clinicalFindings || ''}
            onChange={(e) => handleChange('clinicalFindings', e.target.value)}
          />
        </div>
      </div>

    </div>
  );
}
