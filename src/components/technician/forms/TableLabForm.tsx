'use client';

import { useTranslations } from 'next-intl';
import { BaseFormProps, LabFindings, LabTestValue } from './types';
import {
  WarningCircleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useResultForm } from '../hooks/useResultForm';
import { FormSection } from './shared/FormSection';
import { FormSelect } from './shared/FormSelect';
import { FormField } from './shared/FormField';
import { UploadCard } from './shared/UploadCard';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';

const LAB_TEST_CONFIG = [
  { name: 'WBC (Bạch cầu)', unit: '×10³/µL', male: '4.0 – 10.0', female: '4.0 – 10.0', step: '0.1' },
  { name: 'RBC (Hồng cầu)', unit: '×10⁶/µL', male: '4.2 – 5.8', female: '3.8 – 5.0', step: '0.01' },
  { name: 'HGB (Huyết sắc tố)', unit: 'g/dL', male: '13.0 – 17.5', female: '12.0 – 15.0', step: '0.1' },
  { name: 'HCT (Hematocrit)', unit: '%', male: '40 – 50', female: '35 – 45', step: '0.1' },
  { name: 'PLT (Tiểu cầu)', unit: '×10³/µL', male: '150 – 400', female: '150 – 400', step: '1' },
  { name: 'MCV', unit: 'fL', male: '80 – 100', female: '80 – 100', step: '1' },
  { name: 'MCH', unit: 'pg', male: '27 – 32', female: '27 – 32', step: '0.1' },
  { name: 'Neutrophil %', unit: '%', male: '40 – 74', female: '40 – 74', step: '1' },
  { name: 'Lymphocyte %', unit: '%', male: '25 – 45', female: '25 – 45', step: '1' },
  { name: 'Monocyte %', unit: '%', male: '3 – 9', female: '3 – 9', step: '1' },
];

const getDefaultFindings = (gender: string = 'FEMALE'): LabFindings => {
  const isFemale = gender === 'FEMALE';
  return {
    results: LAB_TEST_CONFIG.map(config => ({
      name: config.name,
      unit: config.unit,
      value: '',
      reference: isFemale ? config.female : config.male,
    })),
    isAbnormal: false,
  };
};

export function TableLabForm({
  isCompleted,
  initialResultText,
  initialFileUrl,
  initialIsAbnormal,
  initialAbnormalNote,
  onSave,
  order,
}: BaseFormProps) {
  const t = useTranslations('technicianWorklist');
  const gender = order.patientProfile?.gender || 'FEMALE';
  const genderLabel = gender === 'MALE' ? t('forms.general.male') : t('forms.general.female');
  
  const {
    form,
    fileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
    form: { formState: { errors } },
  } = useResultForm<LabFindings>({
    initialData: initialResultText ? JSON.parse(initialResultText) : getDefaultFindings(gender),
    initialFileUrl,
    initialIsAbnormal,
    initialAbnormalNote,
    onSave,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "results"
  });

  const evaluateValue = (val: string | number | undefined, ref: string): LabTestValue['evaluation'] => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return undefined;
    
    // Tìm tất cả các số trong chuỗi ngưỡng (hỗ trợ cả số thập phân)
    const numbers = ref.match(/[-+]?\d*\.?\d+/g);
    if (numbers && numbers.length >= 2) {
      const low = parseFloat(numbers[0]);
      const high = parseFloat(numbers[1]);
      if (num < low) return 'low';
      if (num > high) return 'high';
      return 'normal';
    }
    return undefined;
  };

  // Watch for changes to update global isAbnormal status and trigger re-renders
  const watchedResults = useWatch({
    control: form.control,
    name: 'results',
  });

  const results = useMemo(() => watchedResults || [], [watchedResults]);

  useEffect(() => {
    const anyAbnormal = results.some(r => {
      const evaluation = evaluateValue(r.value, r.reference);
      return evaluation === 'high' || evaluation === 'low';
    });
    
    if (anyAbnormal !== isAbnormal) {
      setIsAbnormal(anyAbnormal);
    }
  }, [results, isAbnormal, setIsAbnormal]);

  return (
    <form id="clinical-result-form" onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 text-emerald-800">
        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600">
          <ClockIcon weight="bold" size={20} />
        </div>
        <div className="text-sm">
          <strong>{t('forms.general.tableLabTypeDesc').split(' — ')[0]}</strong> — {t('forms.general.tableLabTypeDesc').split(' — ')[1]}
        </div>
      </div>

      <div className="w-full flex flex-col gap-8">
        <div className="w-full space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('forms.general.tableLabSectionTitle')}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
                    <th className="px-6 py-4">{t('forms.general.tableLabHeaderIndex')}</th>
                    <th className="px-6 py-4 w-32">{t('forms.general.tableLabHeaderValue')}</th>
                    <th className="px-6 py-4 w-24">{t('forms.general.tableLabHeaderUnit')}</th>
                    <th className="px-6 py-4">{t('forms.general.tableLabHeaderRange', { gender: genderLabel })}</th>
                    <th className="px-6 py-4 w-32">{t('forms.general.tableLabHeaderEvaluation')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, i) => {
                    const row = results[i] || field;
                    const value = row.value ?? '';
                    const reference = row.reference ?? '';
                    const evaluation = evaluateValue(value, reference);
                    const step = LAB_TEST_CONFIG[i]?.step || '0.1';
                    
                    const hasError = !!errors.results?.[i]?.value;
                    const translatedIndexName = t(`forms.general.tableLabDEFAULT_index_${i}` as Parameters<typeof t>[0]);
                    
                    return (
                      <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">{translatedIndexName}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step={step}
                            disabled={isCompleted}
                            {...form.register(`results.${i}.value`, {
                              required: t('forms.general.tableLabRequiredValue'),
                              validate: (v) => parseFloat(String(v)) > 0 || t('forms.general.tableLabInvalidValue')
                            })}
                            className={cn(
                              "w-full px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto scroll-mt-28",
                              hasError 
                                ? "bg-rose-50 border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-rose-100 placeholder:text-rose-200 shadow-[0_0_1px_1px_rgba(244,63,94,0.2)]"
                                : evaluation === 'high' ? "bg-amber-50 border-amber-200 text-amber-700" :
                                  evaluation === 'low' ? "bg-rose-50 border-rose-200 text-rose-700" :
                                  evaluation === 'normal' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                  "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                            )}
                            placeholder="0.0"
                          />
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{results[i].unit}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400 font-mono">{results[i].reference}</td>
                        <td className="px-6 py-4">
                          {evaluation && (
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                              evaluation === 'high' ? "bg-amber-100 text-amber-700" :
                              evaluation === 'low' ? "bg-rose-100 text-rose-700" :
                              "bg-emerald-100 text-emerald-700"
                            )}>
                              {evaluation === 'high' 
                                ? t('forms.general.tableLabEvaluationHigh') 
                                : evaluation === 'low' 
                                  ? t('forms.general.tableLabEvaluationLow') 
                                  : t('forms.general.tableLabEvaluationNormal')}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <FormSection title={t('forms.general.tableLabSectionComment')} accentColor="bg-blue-500">
            <textarea
              disabled={isCompleted}
              {...form.register('generalComment')}
              className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
              placeholder={t('forms.general.tableLabPlaceholderComment')}
            />
          </FormSection>
        </div>

        <div className="w-full space-y-6">
          <FormSection title={t('forms.general.tableLabSectionUpload')} accentColor="bg-slate-400">
            <div className="space-y-4 pb-4 border-b border-slate-100">
              <FormField 
                label={t('forms.general.tableLabDeviceLabel')} 
                required 
                error={errors.device?.message}
              >
                <FormSelect
                  control={form.control}
                  name="device"
                  disabled={isCompleted}
                  placeholder={t('forms.general.tableLabPlaceholderDevice')}
                  rules={{ required: t('forms.general.tableLabRequiredDevice') }}
                  options={[
                    { label: 'Sysmex XN-550', value: 'Sysmex XN-550' },
                    { label: 'Abbott Alinity hq', value: 'Abbott Alinity hq' },
                    { label: 'Beckman Coulter', value: 'Beckman Coulter' },
                  ]}
                />
              </FormField>
            </div>

            <UploadCard 
              onFileSelect={handleFileUpload}
              onFileDelete={handleFileDelete}
              isUploading={isUploading}
              fileUrl={fileUrl}
              label={t('forms.general.tableLabUploadLabel')}
              hint="PDF, CSV, HL7 (MAX 10MB)"
              accentColor="blue"
              disabled={isCompleted}
            />

            <div className={cn(
              "p-6 rounded-[28px] border flex items-center justify-between transition-all group shadow-sm",
              isAbnormal 
                ? "bg-rose-50 border-rose-200" 
                : "bg-emerald-50 border-emerald-200"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm",
                  isAbnormal ? "bg-rose-500 text-white shadow-rose-200" : "bg-emerald-500 text-white shadow-emerald-200"
                )}>
                  {isAbnormal ? <WarningCircleIcon weight="fill" size={24} /> : <CheckCircleIcon weight="fill" size={24} />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isAbnormal ? "text-rose-800" : "text-emerald-800"
                  )}>
                    {isAbnormal ? t('forms.general.tableLabSystemAbnormal') : t('forms.general.tableLabSystemNormal')}
                  </p>
                  <p className={cn(
                    "text-[10px] font-medium opacity-80 mt-0.5 uppercase tracking-widest",
                    isAbnormal ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {isAbnormal ? t('forms.general.tableLabSystemAbnormalHint') : t('forms.general.tableLabSystemNormalHint')}
                  </p>
                </div>
              </div>

              {/* Automated Toggle UI (Read Only for Lab) */}
              <div className="flex items-center opacity-60 backdrop-grayscale-[0.5]">
                <div className={cn(
                  "w-14 h-8 rounded-full relative transition-all duration-300 flex items-center px-1 shadow-inner",
                  isAbnormal ? "bg-rose-500" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform",
                    isAbnormal ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </form>
  );
}
