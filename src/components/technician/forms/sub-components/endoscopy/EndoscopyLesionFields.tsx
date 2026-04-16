import { UseFormReturn } from 'react-hook-form';
import { EndoscopyFinding } from '../../types';
import { FormSelect } from '../../shared/FormSelect';

interface EndoscopyLesionFieldsProps {
  form: UseFormReturn<EndoscopyFinding>;
  disabled?: boolean;
}

export function EndoscopyLesionFields({ form, disabled }: EndoscopyLesionFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Vị trí tổn thương</label>
        <input 
          type="text" 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-orange-400 outline-none transition-all"
          placeholder="VD: Hang vị bờ cong nhỏ"
          {...form.register('lesionPosition')}
          disabled={disabled}
        />
      </div>
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Kích thước (mm)</label>
        <input 
          type="text" 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-orange-400 outline-none transition-all"
          placeholder="8"
          {...form.register('lesionSize')}
          disabled={disabled}
        />
      </div>
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tá tràng</label>
        <FormSelect
          control={form.control}
          name="duodenum"
          disabled={disabled}
          placeholder="Chọn tình trạng..."
          options={[
            { label: 'Bình thường', value: 'Bình thường' },
            { label: 'Loét tá tràng', value: 'Loét tá tràng' },
            { label: 'Viêm tá tràng', value: 'Viêm tá tràng' },
          ]}
        />
      </div>
    </div>
  );
}
