'use client';

import { UseFormReturn } from 'react-hook-form';
import { BaseFormProps, FunctionalFinding, EcgFinding, SpirometryFinding } from './types';
import {
  WarningCircleIcon,
  CheckIcon,
  ClockIcon,
  ActivityIcon,
  WindIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useResultForm } from '../hooks/useResultForm';
import { FormSection } from './shared/FormSection';
import { FormField } from './shared/FormField';
import { UploadCard } from './shared/UploadCard';
import { EcgFields } from './sub-components/functional/EcgFields';
import { SpirometryFields } from './sub-components/functional/SpirometryFields';

export function FunctionalForm({
  order,
  isCompleted,
  initialResultText,
  initialFileUrl,
  initialIsAbnormal,
  initialAbnormalNote,
  onSave,
}: BaseFormProps) {
  // const t = useTranslations('technicianWorklist');
  const serviceType = order.service?.name?.toUpperCase() || '';
  const isSpirometry = serviceType.includes('HÔ HẤP') || serviceType.includes('SPIROMETRY');
  
  const DEFAULT_ECG: EcgFinding = {
    heartRate: 75,
    prInterval: 160,
    qrsDuration: 80,
    qtcInterval: 420,
    axis: '',
    rhythm: '',
    stSegment: '',
    pWave: '',
    qWave: 'Không có',
    description: '',
    conclusion: '',
  };

  const DEFAULT_SPIROMETRY: SpirometryFinding = {
    preBronchodilator: true,
    quality: '',
    fvc: { value: 0, percent: 0 },
    fev1: { value: 0, percent: 0 },
    fev1FvcRatio: 0,
    pef: 0,
    fef2575: 0,
    mvv: 0,
    goldStage: '',
    description: '',
    conclusion: '',
  };

  const {
    form,
    fileUrl,
    isAbnormal,
    setIsAbnormal,
    isUploading,
    handleFileUpload,
    handleSubmit,
  } = useResultForm<FunctionalFinding>({
    initialData: initialResultText ? JSON.parse(initialResultText) : (isSpirometry ? DEFAULT_SPIROMETRY : DEFAULT_ECG),
    initialFileUrl,
    initialIsAbnormal,
    initialAbnormalNote,
    onSave,
  });

  return (
    <form id="clinical-result-form" onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className={cn(
        "rounded-2xl p-4 flex items-center gap-4 border",
        isSpirometry ? "bg-sky-50/50 border-sky-100 text-sky-800" : "bg-rose-50/50 border-rose-100 text-rose-800"
      )}>
        <div className="w-10 h-10 rounded-xl bg-white border border-inherit flex items-center justify-center">
          <ClockIcon weight="bold" size={20} />
        </div>
        <div className="text-sm">
          <strong>Loại: {isSpirometry ? 'Thăm dò chức năng hô hấp' : 'Điện tâm đồ (ECG)'}</strong> — Nhập các chỉ số kỹ thuật từ bản ghi máy. Hệ thống hỗ trợ lưu trữ các thông số định lượng chi tiết.
        </div>
      </div>

      <div className="w-full flex flex-col gap-8">
        <div className="w-full space-y-6">
          <FormSection 
            title="Thông số định lượng" 
            accentColor={isSpirometry ? "bg-sky-500" : "bg-rose-500"}
          >
            {isSpirometry ? (
              <SpirometryFields form={form as unknown as UseFormReturn<SpirometryFinding>} disabled={isCompleted} />
            ) : (
              <EcgFields form={form as unknown as UseFormReturn<EcgFinding>} disabled={isCompleted} />
            )}

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả & Kết luận chuyên môn</label>
              <textarea 
                className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400"
                placeholder="VD: Nhịp tim đều, trục trung gian..."
                {...form.register('description')}
                disabled={isCompleted}
              />
            </div>
            
            <FormField 
              label="Kết luận cuối cùng" 
              required 
              error={form.formState.errors.conclusion?.message}
            >
              <input 
                type="text" 
                className={cn(
                  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-400 outline-none transition-all",
                  form.formState.errors.conclusion && "border-rose-300 bg-rose-50/10"
                )}
                placeholder="VD: Điện tâm đồ trong giới hạn bình thường..."
                {...form.register('conclusion', { required: 'Vui lòng nhập kết luận cuối cùng' })}
                disabled={isCompleted}
              />
            </FormField>
          </FormSection>
        </div>

        <div className="w-full space-y-6">
          <FormSection title="Tài liệu & Cảnh báo" accentColor="bg-slate-400">
            <div className="flex flex-col items-center text-center gap-4 pb-4 border-b border-slate-100">
              <div className={cn(
                "w-16 h-16 rounded-[24px] flex items-center justify-center",
                isSpirometry ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-600"
              )}>
                {isSpirometry ? <WindIcon weight="duotone" size={32} /> : <ActivityIcon weight="duotone" size={32} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{isSpirometry ? 'Hố hấp ký' : 'Điện tim (ECG)'}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Đảm bảo bệnh nhân thực hiện đúng kỹ thuật trước khi lưu.</p>
              </div>
            </div>

            <UploadCard 
              onFileSelect={handleFileUpload}
              isUploading={isUploading}
              fileUrl={fileUrl}
              label="Bản ghi máy (Tracing)"
              hint="PDF, PNG, JPG (MAX 20MB)"
              accentColor={isSpirometry ? "sky" : "rose"}
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
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-lg",
                  isAbnormal ? "bg-rose-500 shadow-rose-200" : "bg-emerald-500 shadow-emerald-200"
                )}>
                  {isAbnormal ? <WarningCircleIcon weight="fill" size={24} /> : <CheckIcon weight="bold" size={24} />}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isAbnormal ? "text-rose-800" : "text-emerald-800"
                  )}>
                    {isAbnormal ? 'Báo động lâm sàng' : 'Bình thường'}
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
                  className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-rose-400 outline-none transition-all shadow-sm"
                  placeholder="VD: Nhịp nhanh kịch phát..."
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
