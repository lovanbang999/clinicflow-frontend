'use client';

import { useState, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { toast } from 'sonner';

interface TabNotesProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
}

export function TabNotes({ item, medicalRecord, onChange }: TabNotesProps) {
  const [notes, setNotes] = useState('');
  const [instructions, setInstructions] = useState(''); // Could map to followUpNote or similar if we wanted
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicalRecord) {
      setNotes(medicalRecord.doctorNotes || '');
      setInstructions(medicalRecord.followUpNote || '');
    }
  }, [medicalRecord]);

  const handleSave = async () => {
    if (isSubmitting) return; // Prevent double save
    try {
      setIsSubmitting(true);
      // We use saveSymptoms for both doctorNotes, etc based on the API definition
      await medicalRecordsApi.saveSymptoms(item.bookingId, {
        doctorNotes: notes
      });
      onChange();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lưu ghi chú');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">Ghi chú bác sĩ (Nội bộ)</div>
        </div>
        
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Nhận xét lâm sàng</label>
          <textarea 
            className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[100px]"
            placeholder="Ghi chú nội bộ, không in ra cho bệnh nhân xem..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        <div>
           <label className="block text-[11px] font-medium text-slate-500 mb-1">Hướng dẫn chuẩn bị (gửi cho BN)</label>
          <textarea 
             className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[80px]"
             placeholder="VD: Nhịn ăn sáng để xét nghiệm máu..."
             value={instructions}
             onChange={(e) => setInstructions(e.target.value)}
             readOnly
             title="Tính năng này sẽ được triển khai trong phiên bản sau"
          />
        </div>
      </div>
    </div>
  );
}
