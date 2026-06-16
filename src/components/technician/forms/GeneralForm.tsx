import { useTranslations } from 'next-intl';
import { BaseFormProps } from './types';
import { CheckIcon, FileTextIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useResultForm } from '../hooks/useResultForm';
import { FormField } from './shared/FormField';
import { UploadCard } from './shared/UploadCard';

export function GeneralForm({
  isCompleted,
  initialResultText,
  initialFileUrl,
  initialIsAbnormal,
  initialAbnormalNote,
  onSave,
}: BaseFormProps) {
  const t = useTranslations('technicianWorklist');

  interface GeneralFormData {
    resultText: string;
    abnormalNote?: string;
  }

  const {
    form,
    fileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
  } = useResultForm<GeneralFormData>({
    initialData: { 
      resultText: initialResultText || '', 
      abnormalNote: initialAbnormalNote || '' 
    },
    initialFileUrl,
    initialIsAbnormal,
    onSave: async (data) => {
      await onSave({
        resultText: data.resultText,
        isAbnormal: data.isAbnormal,
        abnormalNote: data.abnormalNote,
        fileUrl: data.fileUrl,
      });
    },
  });

  return (
    <form id="clinical-result-form" onSubmit={handleSubmit} className="space-y-8 pb-8 animate-in fade-in duration-500">
      {/* Text Result Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
              <FileTextIcon size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t('forms.general.generalSectionTitle')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clinical Findings & Narrative</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <FormField 
            label={t('forms.general.generalDescLabel')} 
            required 
            error={form.formState.errors.resultText?.message}
          >
            <textarea
              readOnly={isCompleted}
              className={cn(
                "w-full min-h-[300px] p-6 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-400 outline-none transition-all resize-none text-slate-800 font-medium text-base shadow-inner disabled:cursor-not-allowed",
                form.formState.errors.resultText && "border-rose-300 bg-rose-50/10"
              )}
              placeholder={t('forms.general.generalPlaceholderDesc')}
              {...form.register('resultText', { required: t('forms.general.generalRequiredDesc') })}
              disabled={isCompleted}
            />
          </FormField>
        </div>
      </div>

      {/* File & Abnormal columns */}
      <div className="flex flex-col gap-8">
        <UploadCard
          label={t('forms.general.generalUploadLabel')}
          hint="PDF, PNG, JPG (MAX 100MB)"
          onFileSelect={handleFileUpload}
          onFileDelete={handleFileDelete}
          isUploading={isUploading}
          fileUrl={fileUrl}
          disabled={isCompleted}
          accentColor="blue"
        />

        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{t('forms.general.generalSectionClassification')}</h4>
          <div 
            className={cn(
              "p-6 rounded-[28px] border flex items-center justify-between transition-all group cursor-pointer shadow-sm",
              isAbnormal 
                ? "bg-rose-50 border-rose-200 shadow-rose-100 shadow-sm" 
                : "bg-emerald-50 border-emerald-200 shadow-emerald-100 shadow-sm"
            )}
            onClick={() => !isCompleted && setIsAbnormal(!isAbnormal)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm",
                isAbnormal ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
              )}>
                {isAbnormal ? <WarningCircleIcon weight="fill" size={24} /> : <CheckIcon weight="bold" size={24} />}
              </div>
              <div>
                <p className={cn(
                  "text-xs font-black uppercase tracking-wider",
                  isAbnormal ? "text-rose-800" : "text-emerald-800"
                )}>
                  {isAbnormal ? t('forms.general.generalAbnormalStatus') : t('forms.general.generalNormalStatus')}
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
            {!isCompleted && (
              <div className="flex items-center">
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
            )}
          </div>

          {isAbnormal && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <FormField 
                label={t('forms.general.generalClinicalNotes')} 
                required 
                error={form.formState.errors.abnormalNote?.message}
              >
                <input
                  type="text"
                  readOnly={isCompleted}
                  className={cn(
                    "w-full px-5 py-3 rounded-2xl border border-rose-200 focus:border-rose-500 outline-none text-sm font-bold text-rose-900 bg-white shadow-sm transition-all",
                    form.formState.errors.abnormalNote && "border-rose-500 bg-rose-50/10"
                  )}
                  placeholder={t('forms.general.generalPlaceholderClinicalNotes')}
                  {...form.register('abnormalNote', { required: isAbnormal ? t('forms.general.generalRequiredAbnormalNote') : false })}
                  disabled={isCompleted}
                />
              </FormField>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
