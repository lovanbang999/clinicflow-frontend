'use client';

import { useState, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { ExaminationLeftPanel } from './ExaminationLeftPanel';
import { ExaminationCenterForm } from './ExaminationCenterForm';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { medicalRecordsApi, type VisitServiceOrder } from '@/lib/api/clinical/medical-records';

interface SpecialistExaminationViewProps {
  item: QueueRecord;
  vso?: VisitServiceOrder; // Pre-loaded VSO (when coming from specialist queue)
  onExit: () => void;
  onSuccess: () => void;
}

export function SpecialistExaminationView({ item, vso: initialVso, onExit, onSuccess }: SpecialistExaminationViewProps) {
  const [orders, setOrders] = useState<VisitServiceOrder[]>(initialVso ? [initialVso] : []);

  // If no pre-loaded VSO, fetch all orders for this booking (legacy path)
  useEffect(() => {
    if (initialVso) return; // Already have orders from direct VSO access
    let cancelled = false;
    medicalRecordsApi.getVisitResults(item.bookingId)
      .then((res) => {
        if (!cancelled && res?.visitServiceOrders) {
          setOrders(res.visitServiceOrders);
        }
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [item.bookingId, initialVso]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f5f5f3] overflow-hidden text-[13px]">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex justify-between items-center shrink-0 w-full mb-0 h-14">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <ArrowLeftIcon size={16} weight="bold" />
          </Button>
          <div>
            <h1 className="text-[16px] font-bold text-slate-800">
              Ghi nhận kết quả khám chuyên khoa
            </h1>
            <p className="text-[12px] text-slate-500">
              Chỉ nhập kết quả khám thực tế. Bác sĩ tư vấn sẽ đọc kết quả này để ra chẩn đoán.
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        <ExaminationLeftPanel item={item} orders={orders} />
        
        <main className="flex-1 flex flex-col p-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
           <ExaminationCenterForm orders={orders} onSuccess={onSuccess} />
        </main>
      </div>
    </div>
  );
}
