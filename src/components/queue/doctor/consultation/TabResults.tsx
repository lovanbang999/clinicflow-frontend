'use client';

import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { useTranslations } from 'next-intl';

interface TabResultsProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
}

export function TabResults({ medicalRecord }: TabResultsProps) {
  const t = useTranslations('emr.visit');
  const tr = useTranslations('emr.visit.resultsTab');
  const services = medicalRecord?.visitServiceOrders || [];
  const labs = medicalRecord?.labOrders || [];

  const allItems = [
    ...services.map(s => ({
      id: s.id,
      name: s.service?.name,
      type: t('rightPanel.services'),
      status: s.status,
      resultText: s.resultText,
      resultFileUrl: s.resultFileUrl,
      isAbnormal: s.isAbnormal,
      abnormalNote: s.abnormalNote
    })),
    ...labs.map(l => ({
      id: l.id,
      name: l.testName,
      type: t('rightPanel.labs'),
      status: l.status,
      resultText: l.result?.resultText,
      resultFileUrl: l.result?.resultFileUrl,
      isAbnormal: l.result?.isAbnormal,
      abnormalNote: l.result?.abnormalNote
    }))
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">{t('tabs.results')}</div>
        </div>
        
        {allItems.length === 0 ? (
          <div className="text-center p-4 text-[12px] text-slate-400 italic">
            {tr('emptyList')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {allItems.map(item => (
              <div key={item.id} className={`p-3 rounded-lg border ${item.isAbnormal ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-[13px] font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.type}</div>
                  </div>
                  {item.status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[11px] font-medium">{tr('statusReady')}</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[11px] font-medium">{tr('statusPending')}</span>
                  )}
                </div>
                
                {item.status === 'COMPLETED' && (
                  <div className="mt-2 text-[12px] text-slate-700 bg-white p-2 rounded border border-slate-100">
                    <div className="mb-1"><span className="text-slate-500 font-medium">{tr('resultLabel')}</span> {item.resultText || '—'}</div>
                    {item.isAbnormal && (
                      <div className="text-red-600 mt-1">
                        <span className="font-semibold">{tr('abnormalLabel')}</span> {item.abnormalNote || tr('noNote')}
                      </div>
                    )}
                    {item.resultFileUrl && (
                      <a href={item.resultFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
                        📄 {tr('viewAttachment')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
