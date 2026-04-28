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
  const { control } = form;
  const { fields } = useFieldArray({
    control,
    name: "readings"
  });

  const getOptionsByLabel = (label: string) => {
    const options = [];
    
    if (label === 'Nhu mô phổi') {
      options.push(
        { label: 'Trong sáng đều, bình thường', value: 'Trong sáng đều, bình thường' },
        { label: 'Đám mờ phổi phải', value: 'Đám mờ phổi phải' },
        { label: 'Đám mờ phổi trái', value: 'Đám mờ phổi trái' },
        { label: 'Khí phế thũng', value: 'Khí phế thũng' }
      );
    } else if (label === 'Màng phổi') {
      options.push(
        { label: 'Bình thường', value: 'Bình thường' },
        { label: 'Tràn dịch phải', value: 'Tràn dịch phải' },
        { label: 'Tràn dịch trái', value: 'Tràn dịch trái' },
        { label: 'Dày dính', value: 'Dày dính' }
      );
    } else if (label === 'Bóng tim (CTR)') {
      options.push(
        { label: 'Bình thường < 0.5', value: 'Bình thường < 0.5' },
        { label: 'Hơi to 0.5–0.6', value: 'Hơi to 0.5–0.6' },
        { label: 'To > 0.6', value: 'To > 0.6' }
      );
    } else if (['Trung thất', 'Cơ hoành', 'Xương / Cột sống'].includes(label)) {
      options.push({ label: 'Bình thường', value: 'Bình thường' });
    }
    
    options.push({ label: 'Bất thường khác...', value: 'Bất thường khác' });
    return options;
  };

  return (
    <FormSection title="Đọc phim — theo từng vùng giải phẫu" accentColor="bg-blue-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {fields.map((field, idx) => {
          const label = form.getValues(`readings.${idx}.label`);
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
                rules={{ required: 'Bắt buộc chọn kết quả' }}
                placeholder="Chọn..."
                options={getOptionsByLabel(label)}
              />
            </FormField>
          );
        })}
      </div>

      <FormField 
        label="Mô tả & Kết luận chuyên môn" 
        required 
        error={form.formState.errors.conclusion?.message}
        className="pt-4"
      >
        <textarea 
          className={cn(
            "w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400",
            form.formState.errors.conclusion && "border-rose-300 bg-rose-50/10"
          )}
          placeholder="VD: Hai phổi trong sáng đều, không thấy đám mờ bất thường..."
          {...form.register('conclusion', { required: 'Vui lòng nhập kết luận chuyên môn' })}
          disabled={disabled}
        />
      </FormField>
    </FormSection>
  );
}
