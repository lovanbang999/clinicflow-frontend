'use client';

import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { CheckIcon, CheckCircleIcon } from '@phosphor-icons/react';

interface ConsultationRightPanelProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onFinalize: () => void;
}

export function ConsultationRightPanel({ item, medicalRecord, onFinalize }: ConsultationRightPanelProps) {
  const t = useTranslations('emr.visit');
  const orders = medicalRecord?.visitServiceOrders || [];
  const labs = medicalRecord?.labOrders || [];
  
  const ordCount = orders.length;
  // Fallback to 0 if service price isn't aggregated properly, 
  // but tab components handle logic properly, we could just calculate total here if we want absolute safety:
  const ordTotal = orders.reduce((s, o) => s + (o.service?.price || 0), 0);
  
  const labCount = labs.length;
  
  const hasOrders = ordCount > 0 || labCount > 0;
  
  const isPhase2 = medicalRecord && ['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep);

  return (
    <div className="bg-white border-l border-gray-200 overflow-y-auto p-4 flex flex-col gap-5">
      
      {/* Status Flow */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
          {t('rightPanel.statusTitle')}
        </div>
        <div className="flex flex-col relative">
          
          <div className="flex gap-2.5 pb-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 border border-[#C0DD97] flex items-center justify-center shrink-0 mt-0.5">
              <CheckIcon size={12} weight="bold" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-slate-800">{t('rightPanel.workflow.reception')}</div>
              <div className="text-[11px] text-slate-500">{t('rightPanel.workflow.receptionDesc')}</div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[22px] w-[1px] h-4 bg-gray-200"></div>

          <div className="flex gap-2.5 pb-2 pt-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 border border-[#C0DD97] flex items-center justify-center shrink-0 mt-0.5">
              <CheckIcon size={12} weight="bold" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-slate-800">{t('rightPanel.workflow.feePaid')}</div>
              <div className="text-[11px] text-slate-500">{t('rightPanel.workflow.done')}</div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[60px] w-[1px] h-4 bg-gray-200"></div>

          <div className="flex gap-2.5 pb-2 pt-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <div className="text-[12px] font-medium text-blue-700">{t('rightPanel.workflow.consulting')}</div>
              <div className="text-[11px] text-blue-500">{t('rightPanel.dr') || 'BS.'} {item.booking.doctor?.fullName}</div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[98px] w-[1px] h-4 bg-gray-200"></div>

          <div className="flex gap-2.5 pb-2 pt-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-white text-slate-300 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">{t('rightPanel.workflow.labPayment')}</div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[136px] w-[1px] h-4 bg-gray-200"></div>

          <div className="flex gap-2.5 pt-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-white text-slate-300 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">{t('rightPanel.workflow.conclusion')}</div>
            </div>
          </div>

        </div>
      </div>

      <div className="h-[1px] bg-gray-200"></div>

      {/* Summary */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
          {t('rightPanel.summaryTitle')}
        </div>
        <div className="flex flex-col gap-1.5 mb-2">
           <div className="flex justify-between items-center text-[12px]">
             <span className="text-slate-500">{t('rightPanel.services')} ({ordCount})</span>
             <span className="font-medium text-slate-800">{ordTotal.toLocaleString('vi-VN')} đ</span>
           </div>
           <div className="flex justify-between items-center text-[12px]">
             <span className="text-slate-500">{t('rightPanel.labs')} ({labCount})</span>
             <span className="font-medium text-slate-800">{t('rightPanel.listPrice')}</span>
           </div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-200"></div>

      {/* Notice Box */}
      {isPhase2 ? (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[12px] text-teal-700">
          <div className="font-bold mb-1">{t('rightPanel.readyB7')}</div>
          {t('rightPanel.readyB7Desc')}
        </div>
      ) : hasOrders ? (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[12px] text-teal-700">
          <div className="font-bold mb-1">{t('rightPanel.readyB3')}</div>
          {t('rightPanel.readyB3Desc', { count: ordCount + labCount })}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[12px] text-amber-700">
          <div className="font-bold mb-1">{t('rightPanel.noticeTitle')}</div>
          {t('rightPanel.noticeDesc')}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto pb-4">
        <Button 
          onClick={onFinalize}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-[44px]"
        >
          <CheckCircleIcon size={18} className="mr-2" />
          {isPhase2 ? t('rightPanel.finalizeBtnB7') : t('rightPanel.finalizeBtnB2')}
        </Button>
      </div>

    </div>
  );
}
