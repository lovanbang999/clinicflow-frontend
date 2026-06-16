'use client';

import { useTranslations } from 'next-intl';
import { BaseFormProps, EchoFinding } from './types';
import {
  WarningCircleIcon,
  CheckIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useResultForm } from '../hooks/useResultForm';
import { FormSection } from './shared/FormSection';
import { FormSelect } from './shared/FormSelect';
import { FormField } from './shared/FormField';
import { UploadCard } from './shared/UploadCard';
import { useFieldArray } from 'react-hook-form';

const DEFAULT_FINDINGS: EchoFinding = {
  device: '',
  probe: '',
  organs: [
    { label: 'Gan — kích thước (cm)', finding: '', measurements: '' },
    { label: 'Túi mật', finding: '', description: '' },
    { label: 'Đường mật', finding: '', description: '' },
    { label: 'Tụy', finding: '', description: '' },
    { label: 'Lách', finding: '', description: '' },
    { label: 'Thận phải', finding: '', description: '' },
    { label: 'Thận trái', finding: '', description: '' },
    { label: 'Dịch ổ bụng', finding: '', description: '' },
  ],
  description: '',
  conclusion: '',
};

export function EchoForm({
  isCompleted,
  initialResultText,
  initialFileUrl,
  initialIsAbnormal,
  initialAbnormalNote,
  onSave,
}: BaseFormProps) {
  const t = useTranslations('technicianWorklist');
  
  const {
    form,
    fileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
  } = useResultForm<EchoFinding>({
    initialData: initialResultText ? JSON.parse(initialResultText) : DEFAULT_FINDINGS,
    initialFileUrl,
    initialIsAbnormal,
    initialAbnormalNote,
    onSave,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "organs"
  });

  return (
    <form id="clinical-result-form" onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-center gap-4 text-teal-800">
        <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 flex items-center justify-center text-teal-600">
          <ClockIcon weight="bold" size={20} />
        </div>
        <div className="text-sm">
          <strong>{t('forms.general.echoTypeDesc').split(' — ')[0]}</strong> — {t('forms.general.echoTypeDesc').split(' — ')[1]}
        </div>
      </div>

      <div className="w-full flex flex-col gap-8">
        <div className="w-full space-y-6">
          <FormSection title={t('forms.general.echoSectionTitle')} accentColor="bg-teal-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {fields.map((field, idx) => {
                const label = t(`forms.general.echoDEFAULT_organs_${idx}` as Parameters<typeof t>[0]);
                const orgLabel = form.getValues(`organs.${idx}.label`);
                return (
                  <FormField 
                    key={field.id} 
                    label={label} 
                    required 
                    error={form.formState.errors.organs?.[idx]?.finding?.message}
                  >
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        className={cn(
                          "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-teal-400 outline-none transition-all",
                          form.formState.errors.organs?.[idx]?.finding && "border-rose-300 bg-rose-50/10"
                        )}
                        placeholder={t('forms.general.placeholderFinding')}
                        {...form.register(`organs.${idx}.finding`, { required: t('forms.general.requiredFinding') })}
                        disabled={isCompleted}
                      />
                      {(orgLabel.includes('Gan') || orgLabel.includes('Lách') || orgLabel.includes('Liver') || orgLabel.includes('Spleen')) && (
                        <input 
                          type="text" 
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:bg-white focus:border-teal-400 outline-none transition-all"
                          placeholder={t('forms.general.placeholderMore')}
                          {...form.register(`organs.${idx}.measurements`)}
                          disabled={isCompleted}
                        />
                      )}
                    </div>
                  </FormField>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{t('forms.general.notesLabel')}</label>
              <textarea 
                className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                placeholder={t('forms.general.placeholderDesc')}
                {...form.register('description')}
                disabled={isCompleted}
              />
            </div>

            <FormField 
              label={t('forms.general.conclusionLabel')} 
              required 
              error={form.formState.errors.conclusion?.message}
            >
              <input 
                type="text" 
                className={cn(
                  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-400 outline-none transition-all",
                  form.formState.errors.conclusion && "border-rose-300 bg-rose-50/10"
                )}
                placeholder={t('forms.general.placeholderConclusion')}
                {...form.register('conclusion', { required: t('forms.general.requiredConclusion') })}
                disabled={isCompleted}
              />
            </FormField>
          </FormSection>
        </div>

        <div className="w-full space-y-6">
          <FormSection title={t('forms.general.sectionUpload')} accentColor="bg-slate-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label={t('forms.general.deviceLabel')} 
                required 
                error={form.formState.errors.device?.message}
              >
                <FormSelect
                  control={form.control}
                  name="device"
                  disabled={isCompleted}
                  rules={{ required: t('forms.general.requiredDevice') }}
                  placeholder={t('forms.general.placeholderDevice')}
                  options={[
                    { label: 'GE Voluson E10', value: 'GE Voluson E10' },
                    { label: 'Samsung HS70A', value: 'Samsung HS70A' },
                    { label: 'Philips Epiq Elite', value: 'Philips Epiq Elite' },
                  ]}
                />
              </FormField>

              <FormField 
                label={t('forms.general.probeLabel')} 
                required 
                error={form.formState.errors.probe?.message}
              >
                <FormSelect
                  control={form.control}
                  name="probe"
                  disabled={isCompleted}
                  rules={{ required: t('forms.general.requiredProbe') }}
                  placeholder={t('forms.general.placeholderProbe')}
                  options={[
                    { label: 'Convex C1-5', value: 'Convex C1-5' },
                    { label: 'Linear L4-12', value: 'Linear L4-12' },
                    { label: 'Endocavity E3-10', value: 'Endocavity E3-10' },
                  ]}
                />
              </FormField>
            </div>

            <UploadCard 
              onFileSelect={handleFileUpload}
              onFileDelete={handleFileDelete}
              isUploading={isUploading}
              fileUrl={fileUrl}
              label={t('forms.general.uploadLabel')}
              hint="PNG, JPG, MP4 (MAX 50MB)"
              accentColor="teal"
              disabled={isCompleted}
            />

            <div 
              className={cn(
                "p-6 rounded-[28px] border flex items-center justify-between transition-all group",
                isAbnormal 
                  ? "bg-rose-50 border-rose-200 shadow-sm shadow-rose-100" 
                  : "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100"
              )}
              onClick={() => !isCompleted && setIsAbnormal(!isAbnormal)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                  isAbnormal ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                )}>
                  {isAbnormal ? <WarningCircleIcon weight="fill" size={24} /> : <CheckIcon weight="bold" size={24} />}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isAbnormal ? "text-rose-800" : "text-emerald-800"
                  )}>
                    {isAbnormal ? t('forms.general.abnormalStatus') : t('forms.general.normalStatus')}
                  </p>
                  <p className={cn(
                    "text-[10px] font-medium opacity-80 mt-0.5 uppercase tracking-widest",
                    isAbnormal ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {isAbnormal ? t('forms.general.abnormalToggleNormal') : t('forms.general.abnormalToggleAbnormal')}
                  </p>
                </div>
              </div>

              {/* Professional Switch UI */}
              <div className="flex items-center">
                <div className={cn(
                  "w-14 h-8 rounded-full relative transition-all duration-300 flex items-center px-1",
                  isAbnormal ? "bg-rose-500" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform",
                    isAbnormal ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </div>
            </div>

            {isAbnormal && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{t('forms.general.clinicalNotes')}</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-rose-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all"
                  placeholder={t('forms.general.placeholderNotes')}
                  {...form.register('abnormalNote' as keyof EchoFinding)}
                  disabled={isCompleted}
                />
              </div>
            )}
          </FormSection>

        </div>
      </div>
    </form>
  );
}
