import { UseFormReturn } from 'react-hook-form';
import { EndoscopyFinding } from '../../types';
import { FormSection } from '../../shared/FormSection';
import { FormSelect } from '../../shared/FormSelect';
import { FormField } from '../../shared/FormField';

interface EndoscopyAssessmentProps {
  form: UseFormReturn<EndoscopyFinding>;
  disabled?: boolean;
}

export function EndoscopyAssessment({ form, disabled }: EndoscopyAssessmentProps) {
  return (
    <FormSection title="Đặc thù nội soi dạ dày" accentColor="bg-orange-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Phạm vi nội soi" 
          required 
          error={form.formState.errors.scopeRange?.message}
        >
          <FormSelect
            control={form.control}
            name="scopeRange"
            disabled={disabled}
            rules={{ required: 'Vui lòng chọn phạm vi' }}
            placeholder="Chọn phạm vi..."
            options={[
              { label: 'EGD: Thực quản + Dạ dày + Tá tràng', value: 'EGD: Thực quản + Dạ dày + Tá tràng' },
              { label: 'Chỉ dạ dày', value: 'Chỉ dạ dày' },
              { label: 'Nội soi đại tràng', value: 'Nội soi đại tràng' },
            ]}
          />
        </FormField>
        <FormField 
          label="Chất lượng chuẩn bị" 
          required 
          error={form.formState.errors.preparation?.message}
        >
          <FormSelect
            control={form.control}
            name="preparation"
            disabled={disabled}
            rules={{ required: 'Vui lòng chọn chất lượng' }}
            placeholder="Chọn chất lượng..."
            options={[
              { label: 'Tốt (Sạch, quan sát rõ)', value: 'Tốt' },
              { label: 'Trung bình', value: 'Trung bình' },
              { label: 'Kém — cần nội soi lại', value: 'Kém' },
            ]}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          label="Niêm mạc thực quản" 
          required 
          error={form.formState.errors.esophagus?.message}
        >
          <FormSelect
            control={form.control}
            name="esophagus"
            disabled={disabled}
            rules={{ required: 'Vui lòng chọn tình trạng thực quản' }}
            placeholder="Chọn tình trạng..."
            options={[
              { label: 'Bình thường', value: 'Bình thường' },
              { label: 'Viêm trào ngược (GERD)', value: 'Viêm trào ngược (GERD)' },
              { label: 'Barrett esophagus', value: 'Barrett esophagus' },
              { label: 'Hẹp thực quản', value: 'Hẹp thực quản' },
            ]}
          />
        </FormField>
        <FormField 
          label="Niêm mạc dạ dày" 
          required 
          error={form.formState.errors.stomach?.message}
        >
          <FormSelect
            control={form.control}
            name="stomach"
            disabled={disabled}
            rules={{ required: 'Vui lòng chọn tình trạng dạ dày' }}
            placeholder="Chọn tình trạng..."
            options={[
              { label: 'Bình thường', value: 'Bình thường' },
              { label: 'Sung huyết lan tỏa', value: 'Sung huyết lan tỏa' },
              { label: 'Loét dạ dày', value: 'Loét dạ dày' },
              { label: 'Teo niêm mạc', value: 'Teo niêm mạc' },
              { label: 'Polyp', value: 'Polyp' },
              { label: 'Xuất huyết', value: 'Xuất huyết' },
            ]}
          />
        </FormField>
      </div>
    </FormSection>
  );
}
