import { useTranslations } from 'next-intl';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ImagingFinding } from '../../types';
import { FormSection } from '../../shared/FormSection';
import { FormSelect } from '../../shared/FormSelect';
import { FormField } from '../../shared/FormField';
import { cn } from '@/lib/utils';

interface ImagingReadingsGridProps {
  form: UseFormReturn<ImagingFinding>;
  disabled?: boolean;
}

export function ImagingReadingsGrid({ form, disabled }: ImagingReadingsGridProps) {
  const t = useTranslations('technicianWorklist');
  const { control } = form;
  const { fields } = useFieldArray({
    control,
    name: "readings"
  });

  const getOptionsByLabel = (label: string) => {
    const options = [];
    
    if (label === 'Nhu mô phổi' || label === 'Lung Parenchyma') {
      options.push(
        { label: t('forms.imaging.options.lungNormal'), value: 'Trong sáng đều, bình thường' },
        { label: t('forms.imaging.options.lungRight'), value: 'Đám mờ phổi phải' },
        { label: t('forms.imaging.options.lungLeft'), value: 'Đám mờ phổi trái' },
        { label: t('forms.imaging.options.lungEmphysema'), value: 'Khí phế thũng' }
      );
    } else if (label === 'Màng phổi' || label === 'Pleura') {
      options.push(
        { label: t('forms.imaging.options.pleuraNormal'), value: 'Bình thường' },
        { label: t('forms.imaging.options.pleuraEffusionRight'), value: 'Tràn dịch phải' },
        { label: t('forms.imaging.options.pleuraEffusionLeft'), value: 'Tràn dịch trái' },
        { label: t('forms.imaging.options.pleuraThickening'), value: 'Dày dính' }
      );
    } else if (label === 'Bóng tim (CTR)' || label === 'Cardiothoracic Ratio (CTR)') {
      options.push(
        { label: t('forms.imaging.options.ctrNormal'), value: 'Bình thường < 0.5' },
        { label: t('forms.imaging.options.ctrBorderline'), value: 'Hơi to 0.5–0.6' },
        { label: t('forms.imaging.options.ctrEnlarged'), value: 'To > 0.6' }
      );
    } else if (['Trung thất', 'Cơ hoành', 'Xương / Cột sống', 'Mediastinum', 'Diaphragm', 'Bones / Spine'].includes(label)) {
      options.push({ label: t('forms.imaging.options.normal'), value: 'Bình thường' });
    }
    
    options.push({ label: t('forms.imaging.options.abnormalOther'), value: 'Bất thường khác' });
    return options;
  };

  return (
    <FormSection title={t('forms.imaging.readingsSectionTitle')} accentColor="bg-blue-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {fields.map((field, idx) => {
          const orgLabel = form.getValues(`readings.${idx}.label`);
          const label = t(`forms.general.imagingDEFAULT_organs_${idx}` as Parameters<typeof t>[0]);
          return (
            <FormField 
              key={field.id}
              label={label} 
              required 
              error={form.formState.errors.readings?.[idx]?.finding?.message}
            >
              <FormSelect
                control={form.control}
                name={`readings.${idx}.finding`}
                disabled={disabled}
                rules={{ required: t('forms.imaging.requiredFinding') }}
                placeholder={t('forms.imaging.placeholderFinding')}
                options={getOptionsByLabel(orgLabel)}
              />
            </FormField>
          );
        })}
      </div>

      <FormField 
        label={t('forms.imaging.notesLabel')} 
        required 
        error={form.formState.errors.conclusion?.message}
        className="pt-4"
      >
        <textarea 
          className={cn(
            "w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400",
            form.formState.errors.conclusion && "border-rose-300 bg-rose-50/10"
          )}
          placeholder={t('forms.imaging.placeholderDesc')}
          {...form.register('conclusion', { required: t('forms.imaging.requiredConclusion') })}
          disabled={disabled}
        />
      </FormField>
    </FormSection>
  );
}
