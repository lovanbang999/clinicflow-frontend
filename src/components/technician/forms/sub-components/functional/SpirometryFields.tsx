import { UseFormReturn } from 'react-hook-form';
import { SpirometryFinding } from '../../types';
import { FormSelect } from '../../shared/FormSelect';
import { FormField } from '../../shared/FormField';
import { cn } from '@/lib/utils';

interface SpirometryFieldsProps {
  form: UseFormReturn<SpirometryFinding>;
  disabled?: boolean;
}

export function SpirometryFields({ form, disabled }: SpirometryFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField 
          label="FVC (L)" 
          required 
          error={form.formState.errors.fvc?.value?.message}
        >
          <input 
            type="number" 
            step="0.01" 
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-sky-400 outline-none transition-all",
              form.formState.errors.fvc?.value && "border-rose-300 bg-rose-50/10"
            )}
            {...form.register('fvc.value', { 
              required: 'Bắt buộc',
              valueAsNumber: true,
              min: { value: 0, message: '>=0' }
            })} 
            disabled={disabled} 
          />
        </FormField>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">FVC (% pred)</label>
          <input 
            type="number" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-sky-400 outline-none transition-all"
            {...form.register('fvc.percent', { valueAsNumber: true })} 
            disabled={disabled} 
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">FEV1 (L)</label>
          <input 
            type="number" 
            step="0.01" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-sky-400 outline-none transition-all"
            {...form.register('fev1.value', { valueAsNumber: true })} 
            disabled={disabled} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">FEV1 (% pred)</label>
          <input 
            type="number" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-sky-400 outline-none transition-all"
            {...form.register('fev1.percent', { valueAsNumber: true })} 
            disabled={disabled} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">FEV1 / FVC Ratio</label>
        <input 
          type="number" 
          step="0.01" 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-sky-400 outline-none transition-all"
          {...form.register('fev1FvcRatio', { valueAsNumber: true })} 
          disabled={disabled} 
        />
      </div>
      <FormField 
        label="GOLD Classification" 
        required 
        error={form.formState.errors.goldStage?.message}
      >
        <FormSelect
          control={form.control}
          name="goldStage"
          disabled={disabled}
          rules={{ required: 'Bắt buộc' }}
          placeholder="Chọn mức độ..."
          options={[
            { label: 'Bình thường', value: 'Bình thường' },
            { label: 'GOLD 1: Nhẹ', value: 'GOLD 1: Nhẹ' },
            { label: 'GOLD 2: Trung bình', value: 'GOLD 2: Trung bình' },
            { label: 'GOLD 3: Nặng', value: 'GOLD 3: Nặng' },
            { label: 'GOLD 4: Rất nặng', value: 'GOLD 4: Rất nặng' },
          ]}
        />
      </FormField>
    </div>
  );
}
