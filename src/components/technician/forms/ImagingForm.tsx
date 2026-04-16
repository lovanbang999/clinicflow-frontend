'use client';

import { BaseFormProps, ImagingFinding } from './types';import {
  WarningCircleIcon,
  CheckIcon,
  ClockIcon,
  MonitorIcon,
} from '@phosphor-icons/react';
import { useResultForm } from '../hooks/useResultForm';
import { FormSection } from './shared/FormSection';
import { UploadCard } from './shared/UploadCard';
import { ImagingParameterGrid } from './sub-components/imaging/ImagingParameterGrid';
import { ImagingReadingsGrid } from './sub-components/imaging/ImagingReadingsGrid';
import { cn } from '@/lib/utils';

const DEFAULT_FINDINGS: ImagingFinding = {
  technique: '',
  quality: '',
  kvp: 120,
  mas: 5,
  readings: [
    { label: 'Nhu mô phổi', finding: '', description: '' },
    { label: 'Màng phổi', finding: '', description: '' },
    { label: 'Bóng tim (CTR)', finding: '', description: '' },
    { label: 'Trung thất', finding: '', description: '' },
    { label: 'Cơ hoành', finding: '', description: '' },
    { label: 'Xương / Cột sống', finding: '', description: '' },
  ],
  conclusion: '',
};

export function ImagingForm({
  isCompleted,
  initialResultText,
  initialFileUrl,
  initialIsAbnormal,
  initialAbnormalNote,
  onSave,
}: BaseFormProps) {
  
  const {
    form,
    fileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    handleFileUpload,
    handleSubmit,
  } = useResultForm<ImagingFinding>({
    initialData: initialResultText ? JSON.parse(initialResultText) : DEFAULT_FINDINGS,
    initialFileUrl,
    initialIsAbnormal,
    initialAbnormalNote,
    onSave,
  });

  return (
    <form id="clinical-result-form" onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-center gap-4 text-teal-800">
        <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 flex items-center justify-center text-teal-600">
          <ClockIcon weight="bold" size={20} />
        </div>
        <div className="text-sm">
          <strong>Loại: X-quang / CĐHA</strong> — Nhập thông số kỹ thuật chụp, đọc phim theo từng vùng giải phẫu, upload ảnh DICOM hoặc JPG.
        </div>
      </div>

      <div className="w-full flex flex-col gap-8">
        <div className="w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImagingParameterGrid form={form} disabled={isCompleted} />

            <div className="bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col justify-center items-center text-center gap-4">
              <div className="w-16 h-16 rounded-[24px] bg-teal-50 text-teal-600 flex items-center justify-center">
                <MonitorIcon weight="duotone" size={32} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">X-quang Kỹ thuật số</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed px-4">Đảm bảo bệnh nhân hít đủ sâu và tư thế đúng tiêu chuẩn PA trước khi chụp.</p>
              </div>
            </div>
          </div>

          <ImagingReadingsGrid form={form} disabled={isCompleted} />
        </div>

        <div className="w-full space-y-6">
          <FormSection title="Đính kèm & Cảnh báo" accentColor="bg-slate-400">
            <UploadCard 
              onFileSelect={handleFileUpload}
              isUploading={isUploading}
              fileUrl={fileUrl}
              label="Hình ảnh X-quang"
              hint="DICOM, PNG, JPG (MAX 100MB)"
              accentColor="teal"
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
                    {isAbnormal ? 'Phát hiện bất thường' : 'Hình ảnh bình thường'}
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ghi chú lâm sàng</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-rose-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-rose-400 outline-none transition-all"
                  placeholder="Lưu ý cho bác sĩ (VD: Nghi khối u...)"
                  {...form.register('abnormalNote')}
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
