'use client';

import { useState } from 'react';
import { type VisitServiceOrder } from '@/lib/api/clinical/medical-records';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StethoscopeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { ExaminationExtendedFields } from './ExaminationExtendedFields';

interface ExaminationCenterFormProps {
  orders: VisitServiceOrder[];
  onSuccess: () => void;
}

export function ExaminationCenterForm({ orders, onSuccess }: ExaminationCenterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app with multiple orders per specialist, we might need a way to select the order.
  // For simplicity, we assume there's one relevant specialized order for this queue instance.
  // We'll just grab the first one or the only one.
  const mainOrder = orders.find(o => o.status !== 'COMPLETED') || orders[0];

  const handleComplete = async () => {
    if (!mainOrder) {
      toast.error('Không tìm thấy chỉ định để hoàn tất.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Giả lập API gọi cập nhật kết quả:
      // await medicalRecordsApi.updateServiceResult(mainOrder.id, { resultText: "...", isAbnormal: false });
      
      toast.success('Đã lưu kết quả khám chuyên khoa!');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi lưu kết quả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mainOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
        <StethoscopeIcon size={48} weight="thin" />
        <p>Phiên khám không có dịch vụ chuyên khoa chờ xử lý.</p>
      </div>
    );
  }

  // Cast examFormType from backend (if available) or fallback to GENERAL
  // We added examFormType to the Service model in Prisma
  const examFormType = (mainOrder.service as { examFormType?: string }).examFormType || 'GENERAL';

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative max-w-4xl mx-auto w-full">
      
      {/* Form Header */}
      <div className="bg-[#fcfdfd] px-6 py-4 border-b border-sidebar-border/50">
        <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
          <StethoscopeIcon size={20} className="text-blue-600" weight="fill" />
          {mainOrder.service.name} — Kết quả khám
        </h2>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <ExaminationExtendedFields examFormType={examFormType} />
      </div>

      {/* Sticky Footer */}
      <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-between items-center z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        <div className="text-[12px] text-slate-500">
          Kết quả sau khi lưu sẽ được đồng bộ ngay lập tức về Bác sĩ tư vấn.
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-[13px] h-[36px]" disabled={isSubmitting}>
             Lưu nháp
          </Button>
          <Button 
            className="text-[13px] h-[36px] bg-blue-600 hover:bg-blue-700 shadow-sm"
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            <CheckCircleIcon size={16} weight="bold" className="mr-1.5" />
            Hoàn tất & Gửi kết quả
          </Button>
        </div>
      </div>
    </div>
  );
}
