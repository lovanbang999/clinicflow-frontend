'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('emr.visit.specialist');
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
      .catch(() => {});
    return () => { cancelled = true; };
  }, [item.bookingId, initialVso]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden text-[13px]">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex justify-between items-center shrink-0 w-full mb-0 h-14 z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
          >
            <ArrowLeftIcon size={16} weight="bold" />
          </Button>
          <div>
            <h1 className="text-[15px] font-bold text-slate-800 tracking-tight">
              {t('recordResultTitle')}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {t('recordResultDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <ExaminationLeftPanel item={item} orders={orders} />

        <main className="flex-1 flex flex-col p-6 overflow-hidden min-h-0">
          <ExaminationCenterForm orders={orders} onSuccess={onSuccess} />
        </main>
      </div>
    </div>
  );
}
