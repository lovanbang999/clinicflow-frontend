import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { ImagingFinding } from '../../types';
import { FormSection } from '../../shared/FormSection';
import { FormSelect } from '../../shared/FormSelect';
import { FormField } from '../../shared/FormField';
import { cn } from '@/lib/utils';

interface ImagingParameterGridProps {
  form: UseFormReturn<ImagingFinding>;
  disabled?: boolean;
}

export function ImagingParameterGrid({ form, disabled }: ImagingParameterGridProps) {
  const t = useTranslations('technicianWorklist');

  return (
    <FormSection title={t('forms.shared.technicalParams')} accentColor="bg-teal-500">
      <div className="space-y-4">
        <FormField 
          label={t('forms.imaging.technique')} 
          required 
          error={form.formState.errors.technique?.message}
        >
          <FormSelect
            control={form.control}
            name="technique"
            disabled={disabled}
            rules={{ required: t('forms.imaging.requiredTechnique') }}
            placeholder={t('forms.imaging.placeholderTechnique')}
            options={[
              { label: 'PA (Posteroanterior)', value: 'PA (Posteroanterior)' },
              { label: 'AP', value: 'AP' },
              { label: 'Lateral', value: 'Lateral' },
              { label: 'PA + Lateral', value: 'PA + Lateral' },
            ]}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField 
            label={t('forms.imaging.kvp')} 
            error={form.formState.errors.kvp?.message}
          >
            <input 
              type="number" 
              className={cn(
                "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-teal-400 outline-none transition-all",
                form.formState.errors.kvp && "border-rose-300 bg-rose-50/10"
              )}
              placeholder="120"
              {...form.register('kvp', { 
                valueAsNumber: true,
                min: { value: 0, message: '>=0' }
              })}
              disabled={disabled}
            />
          </FormField>
          <FormField 
            label={t('forms.imaging.mas')} 
            error={form.formState.errors.mas?.message}
          >
            <input 
              type="number" 
              className={cn(
                "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-teal-400 outline-none transition-all",
                form.formState.errors.mas && "border-rose-300 bg-rose-50/10"
              )}
              placeholder="5"
              {...form.register('mas', { 
                valueAsNumber: true,
                min: { value: 0, message: '>=0' }
              })}
              disabled={disabled}
            />
          </FormField>
        </div>
        <FormField 
          label={t('forms.imaging.quality')} 
          required 
          error={form.formState.errors.quality?.message}
        >
          <FormSelect
            control={form.control}
            name="quality"
            disabled={disabled}
            rules={{ required: t('forms.imaging.requiredQuality') }}
            placeholder={t('forms.imaging.placeholderQuality')}
            options={[
              { label: t('forms.imaging.options.good'), value: 'Tốt — đạt tiêu chuẩn' },
              { label: t('forms.imaging.options.acceptable'), value: 'Chấp nhận được' },
              { label: t('forms.imaging.options.redo'), value: 'Cần chụp lại' },
            ]}
          />
        </FormField>
      </div>
    </FormSection>
  );
}
