'use client';

import { BaseFormProps, EndoscopyFinding } from './types';
import {
  WarningCircleIcon,
  CheckIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useResultForm } from '../hooks/useResultForm';
import { FormSection } from './shared/FormSection';
import { FormSelect } from './shared/FormSelect';
import { FormField } from './shared/FormField';
import { UploadCard } from './shared/UploadCard';
import { EndoscopyAssessment } from './sub-components/endoscopy/EndoscopyAssessment';
import { EndoscopyLesionFields } from './sub-components/endoscopy/EndoscopyLesionFields';
import { EndoscopyTestFields } from './sub-components/endoscopy/EndoscopyTestFields';
import { useEffect } from 'react';

const DEFAULT_FINDINGS: EndoscopyFinding = {
  scopeRange: '',
  preparation: '',
  esophagus: '',
  stomach: '',
  duodenum: '',
  cloTest: 'NOT_DONE',
  biopsy: 'NONE',
  lesionPosition: '',
  lesionSize: '',
  description: '',
  conclusion: '',
  followUpMonths: 'Không cần',
};

export function EndoscopyForm({
  isCompleted,
  initialResultText,
  initialFileUrl,
  initialIsAbnormal,
  initialAbnormalNote,
  onSave,
}: BaseFormProps) {
  // const t = useTranslations('technicianWorklist');
  
  const {
    form,
    fileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    handleFileUpload,
    handleSubmit,
  } = useResultForm<EndoscopyFinding>({
    initialData: initialResultText ? JSON.parse(initialResultText) : DEFAULT_FINDINGS,
    initialFileUrl,
    initialIsAbnormal,
    initialAbnormalNote,
    onSave,
  });

  // Business logic: if CLO test is positive, mark as abnormal
  const cloTestValue = form.watch('cloTest');
  useEffect(() => {
    if (cloTestValue === 'POSITIVE') {
      setIsAbnormal(true);
    }
  }, [cloTestValue, setIsAbnormal]);

  return (
    <form id="clinical-result-form" onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-center gap-4 text-orange-800">
        <div className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center text-orange-600">
          <ClockIcon weight="bold" size={20} />
        </div>
        <div className="text-sm">
          <strong>Loại: Nội soi</strong> — Form có thêm trường đặc thù: phạm vi, tình trạng niêm mạc từng đoạn, CLO test H.pylori, sinh thiết.
        </div>
      </div>

      <div className="w-full flex flex-col gap-8">
        <div className="w-full space-y-6">
          <EndoscopyAssessment form={form} disabled={isCompleted} />
          
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-5 bg-orange-200 rounded-full" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Chi tiết bệnh lý & Xét nghiệm</h3>
            </div>
            <EndoscopyLesionFields form={form} disabled={isCompleted} />
            <EndoscopyTestFields form={form} disabled={isCompleted} />
          </div>

          <FormSection title="Mô tả & Kết luận" accentColor="bg-blue-500">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả chi tiết</label>
              <textarea 
                className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                placeholder="VD: Thực quản bình thường. Niêm mạc dạ dày sung huyết lan tỏa..."
                {...form.register('description')}
                disabled={isCompleted}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Kết luận nội soi" 
                required 
                error={form.formState.errors.conclusion?.message}
              >
                <FormSelect
                  control={form.control}
                  name="conclusion"
                  disabled={isCompleted}
                  rules={{ required: 'Vui lòng chọn kết luận' }}
                  placeholder="Chọn kết luận..."
                  options={[
                    { label: 'Dạ dày bình thường', value: 'Dạ dày bình thường' },
                    { label: 'Viêm dạ dày Hp (+)', value: 'Viêm dạ dày Hp (+)' },
                    { label: 'Viêm dạ dày Hp (-)', value: 'Viêm dạ dày Hp (-)' },
                    { label: 'Loét dạ dày', value: 'Loét dạ dày' },
                    { label: 'Ung thư biểu mô dạ dày', value: 'Ung thư biểu mô dạ dày' },
                    { label: 'Polyp dạ dày', value: 'Polyp dạ dày' },
                  ]}
                />
              </FormField>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Hẹn tái khám (tháng)</label>
                <FormSelect
                  control={form.control}
                  name="followUpMonths"
                  disabled={isCompleted}
                  placeholder="Chọn thời gian..."
                  options={[
                    { label: 'Không cần', value: 'Không cần' },
                    { label: '1 tháng', value: '1 tháng' },
                    { label: '3 tháng', value: '3 tháng' },
                    { label: '6 tháng', value: '6 tháng' },
                  ]}
                />
              </div>
            </div>
          </FormSection>
        </div>

        <div className="w-full space-y-6">
          <FormSection title="Tải lên & Cảnh báo" accentColor="bg-slate-400">
            <UploadCard 
              onFileSelect={handleFileUpload}
              isUploading={isUploading}
              fileUrl={fileUrl}
              label="Hình ảnh nội soi"
              hint="PNG, JPG, MP4 (MAX 50MB)"
              accentColor="orange"
              disabled={isCompleted}
            />

            <div 
              className={cn(
                "p-6 rounded-[28px] border flex items-center justify-between transition-all group",
                isAbnormal 
                  ? "bg-rose-50 border-rose-200 shadow-sm shadow-rose-100" 
                  : "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100"
              )}
              onClick={() => !isCompleted && setIsAbnormal(!isAbnormal)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                  isAbnormal ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                )}>
                  {isAbnormal ? <WarningCircleIcon weight="fill" size={24} /> : <CheckIcon weight="bold" size={24} />}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isAbnormal ? "text-rose-800" : "text-emerald-800"
                  )}>
                    {isAbnormal ? 'Kết quả bất thường' : 'Kết quả bình thường'}
                  </p>
                  <p className={cn(
                    "text-[10px] font-medium opacity-80 mt-0.5 uppercase tracking-widest",
                    isAbnormal ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {isAbnormal ? 'Nhấn để đánh dấu bình thường' : 'Nhấn nếu phát hiện bất thường'}
                  </p>
                </div>
              </div>

              {/* Professional Switch UI */}
              <div className="flex items-center">
                <div className={cn(
                  "w-14 h-8 rounded-full relative transition-all duration-300 flex items-center px-1",
                  isAbnormal ? "bg-rose-500" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform",
                    isAbnormal ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </div>
            </div>

            {isAbnormal && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ghi chú bất thường</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-rose-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all"
                  placeholder="VD: Viêm loét nặng..."
                  {...form.register('abnormalNote' as keyof EndoscopyFinding)}
                  disabled={isCompleted}
                />
              </div>
            )}
          </FormSection>

        </div>
      </div>
    </form>
  );
}
