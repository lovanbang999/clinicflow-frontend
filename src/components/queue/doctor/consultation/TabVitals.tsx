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
  isReadOnly?: boolean;
}

import { NumericStepper, QuickSuggestions } from '../shared/ExamHelpers';

export function TabVitals({ item, medicalRecord, onChange, isReadOnly }: TabVitalsProps) {
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
    if (isReadOnly) return;
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
        void error;
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
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full">
      {/* Vitals & Anthropometrics Grid */}
      <div className="flex-none grid grid-cols-4 gap-2.5">
        {/* ROW 1: PRIMARY VITALS */}
        {/* BP */}
        <div className={`col-span-2 bg-white border rounded-xl p-3 shadow-sm transition-all duration-200 ${isAbnormalBp ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('symptoms.bp')}</span>
            {!isReadOnly && (
              <QuickSuggestions 
                className="mt-0 gap-1"
                suggestions={['120/80', '110/70', '130/80', '140/90']}
                onSelect={(s) => handleChange('bloodPressure', s)}
                currentValue={formData.bloodPressure}
              />
            )}
          </div>
          <div className="flex items-center">
            <input 
              className={`bg-transparent text-[18px] font-bold text-slate-900 w-full focus:outline-none placeholder:text-slate-300 ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              placeholder={isReadOnly ? '—' : '120/80'} 
              value={formData.bloodPressure || ''}
              onChange={(e) => handleChange('bloodPressure', e.target.value)}
              readOnly={isReadOnly}
            />
            <span className="text-[11px] font-semibold text-slate-400">mmHg</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className={`col-span-1 bg-white border rounded-xl p-3 shadow-sm transition-all duration-200 flex flex-col justify-between ${isAbnormalHr ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('symptoms.heartRate')}</span>
            {!isReadOnly && (
              <QuickSuggestions 
                className="mt-0 gap-1 scale-90 origin-right"
                suggestions={['70', '80', '90']}
                onSelect={(s) => handleChange('heartRate', parseInt(s))}
                currentValue={formData.heartRate?.toString()}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <NumericStepper 
              className="scale-90 origin-left"
              value={formData.heartRate} 
              onChange={(val) => handleChange('heartRate', val ? parseFloat(val) : undefined)} 
              disabled={isReadOnly}
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1 whitespace-nowrap">{t('symptoms.heartRateUnit')}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className={`col-span-1 bg-white border rounded-xl p-3 shadow-sm transition-all duration-200 flex flex-col justify-between ${isAbnormalTemp ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('symptoms.temperature')}</span>
            {!isReadOnly && (
              <QuickSuggestions 
                className="mt-0 gap-1 scale-90 origin-right"
                suggestions={['36.5', '37', '37.5']}
                onSelect={(s) => handleChange('temperature', parseFloat(s))}
                currentValue={formData.temperature?.toString()}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <NumericStepper 
              className="scale-90 origin-left"
              value={formData.temperature} 
              step={0.1}
              onChange={(val) => handleChange('temperature', val ? parseFloat(val) : undefined)} 
              disabled={isReadOnly}
            />
            <span className="text-[9px] font-bold text-slate-400 ml-1">°C</span>
          </div>
        </div>

        {/* ROW 2: ANTHROPOMETRICS & OTHERS */}
        {/* SpO2 */}
        <div className={`col-span-1 bg-white border rounded-xl p-3 shadow-sm transition-all duration-200 flex flex-col justify-between ${isAbnormalSpo2 ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SpO₂</span>
            {!isReadOnly && (
              <QuickSuggestions 
                className="mt-0 gap-1 scale-90 origin-right"
                suggestions={['98', '99', '100']}
                onSelect={(s) => handleChange('spO2', parseInt(s))}
                currentValue={formData.spO2?.toString()}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <NumericStepper 
              className="scale-90 origin-left"
              value={formData.spO2} 
              min={0}
              max={100}
              onChange={(val) => handleChange('spO2', val ? parseFloat(val) : undefined)} 
              disabled={isReadOnly}
            />
            <span className="text-[9px] font-bold text-slate-400 ml-1">%</span>
          </div>
        </div>

        {/* Weight */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('symptoms.weight')}</span>
            {!isReadOnly && (
              <QuickSuggestions 
                className="mt-0 gap-1 scale-90 origin-right"
                suggestions={['50', '60', '70']}
                onSelect={(s) => handleChange('weightKg', parseInt(s))}
                currentValue={formData.weightKg?.toString()}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <NumericStepper 
              className="scale-90 origin-left"
              value={formData.weightKg} 
              onChange={(val) => handleChange('weightKg', val ? parseFloat(val) : undefined)} 
              disabled={isReadOnly}
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">kg</span>
          </div>
        </div>

        {/* Height */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{t('symptoms.height')}</span>
            {!isReadOnly && (
              <QuickSuggestions 
                className="mt-0 gap-1 scale-90 origin-right"
                suggestions={['155', '165', '170']}
                onSelect={(s) => handleChange('heightCm', parseInt(s))}
                currentValue={formData.heightCm?.toString()}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-auto">
            <NumericStepper 
              className="scale-90 origin-left"
              value={formData.heightCm} 
              onChange={(val) => handleChange('heightCm', val ? parseFloat(val) : undefined)} 
              disabled={isReadOnly}
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">cm</span>
          </div>
        </div>

        {/* BMI integrated result */}
        <div className={`col-span-1 bg-white border rounded-xl p-3 shadow-sm flex flex-col justify-between transition-all duration-200 ${isAbnormalBmi ? 'bg-amber-50/50 border-amber-200' : 'border-slate-200'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BMI</div>
          <div className="flex items-baseline gap-1.5 overflow-hidden">
            <span className="text-[16px] font-bold text-slate-900">{bmiSpan}</span>
            <span className="text-[9px] font-bold text-slate-500 truncate bg-slate-100 px-1 py-0.5 rounded uppercase tracking-tighter">
              {bmiCat || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Symptoms & Clinical Findings - Vertical Stack for more space */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Symptoms Section */}
        <div className="flex-none bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
            <div className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{t('symptoms.header')}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t('symptoms.chiefComplaint')}</label>
              <textarea 
                className={`w-full border rounded-lg p-2.5 text-[12px] min-h-[60px] transition-all resize-none ${isReadOnly ? 'bg-slate-50 border-slate-100 text-slate-700 outline-none' : 'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 border-slate-200'}`}
                placeholder={isReadOnly ? '—' : t('symptoms.chiefComplaintPlaceholder')}
                value={formData.chiefComplaint || ''}
                onChange={(e) => handleChange('chiefComplaint', e.target.value)}
                readOnly={isReadOnly}
              />
              {!isReadOnly && (
                <QuickSuggestions 
                  className="gap-1 mt-1.5"
                  suggestions={['Sốt', 'Ho', 'Đau đầu', 'Đau bụng', 'Mệt mỏi', 'Khó thở', 'Đau họng', 'Chảy mũi']} 
                  onSelect={(s) => handleChange('chiefComplaint', (formData.chiefComplaint ? `${formData.chiefComplaint}, ${s}` : s))}
                />
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t('symptoms.additionalSymptoms')}</label>
              <textarea 
                className={`w-full border rounded-lg p-2.5 text-[12px] min-h-[60px] transition-all resize-none ${isReadOnly ? 'bg-slate-50 border-slate-100 text-slate-700 outline-none' : 'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 border-slate-200'}`}
                placeholder={isReadOnly ? '—' : t('symptoms.additionalSymptomsPlaceholder')}
                value={formData.additionalSymptoms || ''}
                onChange={(e) => handleChange('additionalSymptoms', e.target.value)}
                readOnly={isReadOnly}
              />
              {!isReadOnly && (
                <QuickSuggestions 
                  className="gap-1 mt-1.5"
                  suggestions={['Chóng mặt', 'Buồn nôn', 'Biếng ăn', 'Mất ngủ', 'Đau người', 'Phát ban', 'Táo bón', 'Tiêu chảy']} 
                  onSelect={(s) => handleChange('additionalSymptoms', (formData.additionalSymptoms ? `${formData.additionalSymptoms}, ${s}` : s))}
                />
              )}
            </div>
          </div>
        </div>

        {/* Clinical Findings Section */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-0">
          <div className="flex-none flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
            <div className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{t('symptoms.clinicalFindings')}</div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <textarea 
              className={`flex-1 w-full border rounded-lg p-2.5 text-[12px] transition-all resize-none ${isReadOnly ? 'bg-slate-50 border-slate-100 text-slate-700 outline-none' : 'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 border-slate-200'}`}
              placeholder={isReadOnly ? '—' : t('symptoms.clinicalFindingsPlaceholder')}
              value={formData.clinicalFindings || ''}
              onChange={(e) => handleChange('clinicalFindings', e.target.value)}
              readOnly={isReadOnly}
            />
            {!isReadOnly && (
              <QuickSuggestions 
                className="flex-none gap-1 mt-1.5"
                suggestions={['Tim đều, T1 T2 rõ', 'Phổi trong, không rale', 'Bụng mềm, không chướng', 'Họng đỏ nhẹ', 'Amidan không sưng']} 
                onSelect={(s) => handleChange('clinicalFindings', (formData.clinicalFindings ? `${formData.clinicalFindings}, ${s}` : s))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
