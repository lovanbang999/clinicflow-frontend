import { UseFormReturn } from 'react-hook-form';
import { EcgFinding } from '../../types';
import { FormSelect } from '../../shared/FormSelect';
import { FormField } from '../../shared/FormField';
import { cn } from '@/lib/utils';

interface EcgFieldsProps {
  form: UseFormReturn<EcgFinding>;
  disabled?: boolean;
}

export function EcgFields({ form, disabled }: EcgFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField 
          label="Nhịp tim (bpm)" 
          required 
          error={form.formState.errors.heartRate?.message}
        >
          <input 
            type="number" 
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all",
              form.formState.errors.heartRate && "border-rose-300 bg-rose-50/10"
            )} 
            {...form.register('heartRate', { 
              required: 'Bắt buộc',
              valueAsNumber: true,
              min: { value: 0, message: 'Min 0' },
              max: { value: 300, message: 'Max 300' }
            })} 
            disabled={disabled} 
          />
        </FormField>
        <FormField 
          label="Trục điện tim" 
          required 
          error={form.formState.errors.axis?.message}
        >
          <FormSelect
            control={form.control}
            name="axis"
            disabled={disabled}
            rules={{ required: 'Bắt buộc' }}
            placeholder="Chọn trục..."
            options={[
              { label: 'Trung gian', value: 'Trung gian' },
              { label: 'Trái', value: 'Trái' },
              { label: 'Phải', value: 'Phải' },
              { label: 'Vô định', value: 'Vô định' },
            ]}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormField label="PR (ms)" error={form.formState.errors.prInterval?.message}>
          <input 
            type="number" 
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all",
              form.formState.errors.prInterval && "border-rose-300 bg-rose-50/10"
            )}
            {...form.register('prInterval', { valueAsNumber: true, min: { value: 0, message: '>=0' } })} 
            disabled={disabled} 
          />
        </FormField>
        <FormField label="QRS (ms)" error={form.formState.errors.qrsDuration?.message}>
          <input 
            type="number" 
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all",
              form.formState.errors.qrsDuration && "border-rose-300 bg-rose-50/10"
            )}
            {...form.register('qrsDuration', { valueAsNumber: true, min: { value: 0, message: '>=0' } })} 
            disabled={disabled} 
          />
        </FormField>
        <FormField label="QTc (ms)" error={form.formState.errors.qtcInterval?.message}>
          <input 
            type="number" 
            className={cn(
              "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all",
              form.formState.errors.qtcInterval && "border-rose-300 bg-rose-50/10"
            )}
            {...form.register('qtcInterval', { valueAsNumber: true, min: { value: 0, message: '>=0' } })} 
            disabled={disabled} 
          />
        </FormField>
      </div>
      <FormField 
        label="Nhịp cơ bản" 
        required 
        error={form.formState.errors.rhythm?.message}
      >
        <FormSelect
          control={form.control}
          name="rhythm"
          disabled={disabled}
          rules={{ required: 'Bắt buộc' }}
          placeholder="Chọn nhịp..."
          options={[
            { label: 'Nhịp xoang đều', value: 'Nhịp xoang đều' },
            { label: 'Nhịp chậm xoang', value: 'Nhịp chậm xoang' },
            { label: 'Nhịp nhanh xoang', value: 'Nhịp nhanh xoang' },
            { label: 'Rung nhĩ', value: 'Rung nhĩ' },
            { label: 'Ngoại tâm thu', value: 'Ngoại tâm thu' },
          ]}
        />
      </FormField>
      <FormField 
        label="ST / T Wave" 
        required 
        error={form.formState.errors.stSegment?.message}
      >
        <FormSelect
          control={form.control}
          name="stSegment"
          disabled={disabled}
          rules={{ required: 'Bắt buộc' }}
          placeholder="Chọn trạng thái..."
          options={[
            { label: 'Bình thường', value: 'Bình thường' },
            { label: 'ST chênh lên', value: 'ST chênh lên' },
            { label: 'ST chênh xuống', value: 'ST chênh xuống' },
            { label: 'T âm', value: 'T âm' },
          ]}
        />
      </FormField>
    </div>
  );
}
