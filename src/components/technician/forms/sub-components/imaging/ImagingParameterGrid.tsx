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
  return (
    <FormSection title="Thông số kỹ thuật" accentColor="bg-teal-500">
      <div className="space-y-4">
        <FormField 
          label="Tư thế chụp" 
          required 
          error={form.formState.errors.technique?.message}
        >
          <FormSelect
            control={form.control}
            name="technique"
            disabled={disabled}
            rules={{ required: 'Vui lòng chọn tư thế' }}
            placeholder="Chọn tư thế..."
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
            label="kVp" 
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
            label="mAs" 
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
          label="Chất lượng phim" 
          required 
          error={form.formState.errors.quality?.message}
        >
          <FormSelect
            control={form.control}
            name="quality"
            disabled={disabled}
            rules={{ required: 'Vui lòng chọn chất lượng' }}
            placeholder="Chọn chất lượng..."
            options={[
              { label: 'Tốt — đạt tiêu chuẩn', value: 'Tốt — đạt tiêu chuẩn' },
              { label: 'Chấp nhận được', value: 'Chấp nhận được' },
              { label: 'Cần chụp lại', value: 'Cần chụp lại' },
            ]}
          />
        </FormField>
      </div>
    </FormSection>
  );
}
