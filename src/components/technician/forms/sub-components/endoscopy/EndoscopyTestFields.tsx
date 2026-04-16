import { UseFormReturn } from 'react-hook-form';
import { EndoscopyFinding } from '../../types';
import { FormSelect } from '../../shared/FormSelect';

interface EndoscopyTestFieldsProps {
  form: UseFormReturn<EndoscopyFinding>;
  disabled?: boolean;
}

export function EndoscopyTestFields({ form, disabled }: EndoscopyTestFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">CLO test (H. pylori)</label>
        <FormSelect
          control={form.control}
          name="cloTest"
          disabled={disabled}
          placeholder="Chọn kết quả..."
          options={[
            { label: 'Không làm', value: 'NOT_DONE' },
            { label: 'Âm tính (-)', value: 'NEGATIVE' },
            { label: 'Dương tính (+)', value: 'POSITIVE' },
          ]}
        />
      </div>
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Sinh thiết</label>
        <FormSelect
          control={form.control}
          name="biopsy"
          disabled={disabled}
          placeholder="Chọn trạng thái..."
          options={[
            { label: 'Không sinh thiết', value: 'NONE' },
            { label: 'Có sinh thiết — gửi GPB', value: 'DONE' },
          ]}
        />
      </div>
    </div>
  );
}
