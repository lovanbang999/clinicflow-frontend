'use client';

import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { type VisitResultsResponse, type SaveSymptomsDto } from '@/lib/api/medical-records';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSaveSymptoms } from '@/lib/hooks/useMedicalRecords';
import { StickyBottomBar } from '@/components/doctor/shared/StickyBottomBar';
import { ArrowRightIcon } from '@phosphor-icons/react';

interface SymptomsTabProps {
  bookingId: string;
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
}

interface SymptomsFormValues extends Omit<SaveSymptomsDto, 'bloodPressure'> {
  bpSystolic?: string;
  bpDiastolic?: string;
}

export function SymptomsTab({ bookingId, record, onSaved }: SymptomsTabProps) {
  const t = useTranslations('emr.visit.symptoms');
  const { saveSymptoms, isSaving } = useSaveSymptoms();

  const { register, handleSubmit, formState: { errors } } = useForm<SymptomsFormValues>({
    defaultValues: {
      chiefComplaint: record?.chiefComplaint ?? '',
      clinicalFindings: record?.clinicalFindings ?? '',
      doctorNotes: record?.doctorNotes ?? '',
      bpSystolic: record?.bloodPressure?.split('/')[0] ?? '',
      bpDiastolic: record?.bloodPressure?.split('/')[1] ?? '',
      heartRate: record?.heartRate ?? undefined,
      temperature: record?.temperature ?? undefined,
      spO2: record?.spO2 ?? undefined,
      weightKg: record?.weightKg ?? undefined,
      heightCm: record?.heightCm ?? undefined,
      bmi: record?.bmi ? Number(record.bmi) : undefined,
      medicalHistory: record?.medicalHistory ?? '',
      allergies: record?.allergies ?? '',
      additionalSymptoms: record?.additionalSymptoms ?? '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const { bpSystolic, bpDiastolic, ...payload } = data;
    // Combine BP
    const bloodPressure = bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : undefined;

    const result = await saveSymptoms(bookingId, {
      ...payload,
      bloodPressure,
    });
    
    if (result?.success) {
      onSaved(result.data);
      toast.success(t('success'));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5 relative">
      <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl p-4 flex gap-3 text-[13.5px] items-start mb-6">
        <span className="text-[18px] leading-none shrink-0">ℹ️</span>
        <div>Ghi nhận đầy đủ triệu chứng và thăm khám lâm sàng trước khi tiến hành các bước tiếp theo. Đây là bước <span className="font-bold">bắt buộc</span>.</div>
      </div>

      {/* Vitals Input Grid B1 */}
      <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
        <div className="text-[13px] font-bold text-gray-700 mb-3.5 flex items-center gap-2 pb-2.5 border-b border-gray-100">
          <span>📊</span> Sinh hiệu <span className="text-[11px] text-gray-400 font-normal">(nhập hoặc lấy từ thiết bị)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="col-span-2 md:col-span-1 space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">Huyết áp thu <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-1">
              <Input
                {...register('bpSystolic', { required: true })}
                placeholder="120"
                className={`text-[14px] bg-white h-[38px] px-2 shadow-none border-gray-200 rounded-lg text-center ${errors.bpSystolic ? 'border-red-500 bg-red-50' : ''}`}
              />
              <span className="text-gray-400">/</span>
              <Input
                {...register('bpDiastolic', { required: true })}
                placeholder="80"
                className={`text-[14px] bg-white h-[38px] px-2 shadow-none border-gray-200 rounded-lg text-center ${errors.bpDiastolic ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>
            { (errors.bpSystolic || errors.bpDiastolic) && <p className="text-[10px] text-red-500 font-medium">Bắt buộc</p> }
            <p className="text-[11.5px] text-gray-400">mmHg</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">Mạch <span className="text-red-500">*</span></Label>
            <Input
              {...register('heartRate', { required: true, valueAsNumber: true })}
              placeholder="72"
              className={`text-[14px] bg-white h-[38px] shadow-none border-gray-200 rounded-lg ${errors.heartRate ? 'border-red-500 bg-red-50' : ''}`}
            />
            { errors.heartRate && <p className="text-[10px] text-red-500 font-medium">Bắt buộc</p> }
            <p className="text-[11.5px] text-gray-400">lần/phút</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">SpO2</Label>
            <Input
              {...register('spO2', { valueAsNumber: true })}
              placeholder="98"
              className="text-[14px] bg-white h-[38px] shadow-none border-gray-200 rounded-lg"
            />
            <p className="text-[11.5px] text-gray-400">%</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">Nhiệt độ</Label>
            <Input
              {...register('temperature', { valueAsNumber: true })}
              placeholder="36.5"
              className="text-[14px] bg-white h-[38px] shadow-none border-gray-200 rounded-lg"
            />
            <p className="text-[11.5px] text-gray-400">°C</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">Cân nặng</Label>
            <Input
              {...register('weightKg', { valueAsNumber: true })}
              placeholder="55"
              className="text-[14px] bg-white h-[38px] shadow-none border-gray-200 rounded-lg"
            />
            <p className="text-[11.5px] text-gray-400">kg</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">Chiều cao</Label>
            <Input
              {...register('heightCm', { valueAsNumber: true })}
              placeholder="160"
              className="text-[14px] bg-white h-[38px] shadow-none border-gray-200 rounded-lg"
            />
            <p className="text-[11.5px] text-gray-400">cm</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
        <div className="font-bold text-[13px] text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <span>🩺</span> B1 — Hỏi triệu chứng bệnh nhân
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">
              Lý do khám / Triệu chứng chính <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('chiefComplaint', { required: true })}
              placeholder={t('chiefComplaintPlaceholder')}
              className={`text-[14px] bg-white border-gray-200 shadow-none border rounded-lg h-[42px] ${errors.chiefComplaint ? 'border-red-500 bg-red-50' : ''}`}
            />
            { errors.chiefComplaint && <p className="text-[10px] text-red-500 font-medium">Bắt buộc nhập lý do khám</p> }
            <p className="text-[11.5px] text-gray-400">Ghi rõ thời gian, mức độ, vị trí</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">
              Triệu chứng kèm theo <span className="text-[11px] font-medium text-gray-400 select-none ml-1">(không bắt buộc)</span>
            </Label>
            <Input
              {...register('additionalSymptoms')}
              placeholder="Khó thở, hồi hộp, mệt mỏi..."
              className="text-[14px] bg-white border-gray-200 shadow-none border rounded-lg h-[42px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">
              Tiền sử bệnh lý <span className="text-[11px] font-medium text-gray-400 select-none ml-1">(không bắt buộc)</span>
            </Label>
            <Input
              {...register('medicalHistory')}
              placeholder="THA, ĐTĐ, bệnh tim mạch..."
              className="text-[14px] bg-white border-gray-200 shadow-none border rounded-lg h-[42px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">
              Dị ứng thuốc <span className="text-[11px] font-medium text-gray-400 select-none ml-1">(không bắt buộc)</span>
            </Label>
            <Input
              {...register('allergies')}
              placeholder="Penicillin, Aspirin..."
              className="text-[14px] bg-white border-gray-200 shadow-none border rounded-lg h-[42px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">
              Kết quả thăm khám lâm sàng <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('clinicalFindings', { required: true })}
              rows={3}
              placeholder="Ghi nhận từ thăm khám trực tiếp..."
              className={`resize-none text-[14px] bg-white border-gray-200 shadow-none border rounded-lg min-h-[100px] ${errors.clinicalFindings ? 'border-red-500 bg-red-50' : ''}`}
            />
            { errors.clinicalFindings && <p className="text-[10px] text-red-500 font-medium">Bắt buộc nhập kết quả thăm khám</p> }
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-bold text-slate-700">
              Ghi chú bổ sung của bác sĩ <span className="text-[11px] font-medium text-gray-400 select-none ml-1">(không bắt buộc)</span>
            </Label>
            <Textarea
              {...register('doctorNotes')}
              rows={2}
              placeholder="Thông tin bổ sung..."
              className="resize-none text-[14px] bg-white border-gray-200 shadow-none border rounded-lg min-h-[100px]"
            />
          </div>
        </div>
      </div>

      <StickyBottomBar title="Bước 1/4 - Hỏi triệu chứng">
        <Button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 h-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all flex items-center gap-2"
        >
          {isSaving ? t('saving') : <>
            <span className="text-sm">Lưu & Tiếp theo</span>
            <ArrowRightIcon className="w-4 h-4" />
          </>}
        </Button>
      </StickyBottomBar>
    </form>
  );
}
