'use client';

import { useTranslations } from 'next-intl';
import { FileTextIcon } from '@phosphor-icons/react';
import type { LabOrder } from '@/lib/api/clinical/lab-orders';

interface LabOrderInfoProps {
  order: LabOrder;
}

export function LabOrderInfo({ order }: LabOrderInfoProps) {
  const t = useTranslations('technicianWorklist.result');

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb] bg-slate-50 flex items-center gap-2">
        <FileTextIcon size={20} weight="bold" className="text-slate-500" />
        <h3 className="font-semibold text-slate-800">{t('orderInfo')}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('testName')}
          </p>
          <p className="font-medium text-blue-600">{order.testName}</p>
        </div>
        {order.booking?.doctor?.fullName && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('doctor')}
            </p>
            <p className="text-slate-900">BS. {order.booking.doctor.fullName}</p>
          </div>
        )}
        {order.testDescription && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('notes')}
            </p>
            <p className="text-slate-700 italic bg-amber-50/50 p-3 rounded-lg text-sm border border-amber-100/50 whitespace-pre-line">
              &quot;{order.testDescription}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
