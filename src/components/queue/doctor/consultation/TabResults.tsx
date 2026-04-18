'use client';

import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { useTranslations } from 'next-intl';
import { LabResultContent } from '@/components/shared/LabResultContent';
import { ClockIcon } from '@phosphor-icons/react';

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {allItems.map(item => {
              const isCompleted = item.status === 'COMPLETED';
              
              return (
                <div 
                  key={item.id} 
                  className={`flex flex-col rounded-xl border transition-all duration-200 ${
                    item.isAbnormal 
                      ? 'bg-amber-50/40 border-amber-200 shadow-sm' 
                      : isCompleted 
                        ? 'bg-white border-slate-200 hover:border-cyan-200 shadow-sm' 
                        : 'bg-slate-50/50 border-slate-100 opacity-80'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 flex justify-between items-start gap-3 border-b border-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          isCompleted ? 'bg-cyan-500 animate-pulse' : 'bg-amber-400'
                        }`} />
                        <div className="text-[14px] font-bold text-slate-800 truncate">{item.name}</div>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{item.type}</div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter shrink-0 border ${
                      isCompleted 
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isCompleted ? tr('statusReady') : tr('statusPending')}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {isCompleted ? (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{tr('resultLabel')}</span>
                          {item.resultFileUrl && (
                            <a 
                              href={item.resultFileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              📄 {tr('viewAttachment')}
                            </a>
                          )}
                        </div>
                        
                        <LabResultContent 
                          text={item.resultText || ''} 
                          imageUrls={item.resultFileUrl ? [item.resultFileUrl] : []}
                          noDetailDesc="—" 
                        />
                        
                        {item.isAbnormal && (
                          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-[12px]">
                            <span className="font-bold flex items-center gap-1 mb-1">
                              ⚠ {tr('abnormalLabel')}
                            </span> 
                            <p className="leading-relaxed">{item.abnormalNote || tr('noNote')}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                          <ClockIcon size={20} className="text-slate-300 animate-spin-slow" />
                        </div>
                        <p className="text-[12px] italic">{tr('statusPending')}...</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
