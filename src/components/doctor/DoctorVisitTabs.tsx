'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type VisitResultsResponse, type VisitStep } from '@/lib/api/clinical/medical-records';
import { SymptomsTab } from './tabs/SymptomsTab';
import { LabOrderTab } from './tabs/LabOrderTab';
import { DiagnosisTab } from './tabs/DiagnosisTab';
import { PrescriptionTab } from './tabs/PrescriptionTab';
import { SummaryTab } from './tabs/SummaryTab';
import { ArrowLeftIcon, SpinnerIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// Ordered steps for progress indicator
const STEPS: { step: VisitStep; labelKey: string; tab: TabId }[] = [
  { step: 'SYMPTOMS_TAKEN', labelKey: 'stepLabels.symptoms', tab: 'symptoms' },
  { step: 'SERVICES_ORDERED', labelKey: 'stepLabels.services', tab: 'labOrders' },
  { step: 'RESULTS_READY', labelKey: 'stepLabels.results', tab: 'diagnosis' },
  { step: 'COMPLETED', labelKey: 'stepLabels.prescription', tab: 'prescription' },
  { step: 'COMPLETED', labelKey: 'stepLabels.summary', tab: 'summary' },
];

type TabId = 'symptoms' | 'labOrders' | 'diagnosis' | 'prescription' | 'summary';

interface DoctorVisitTabsProps {
  bookingId: string;
  className?: string;
  onExit?: () => void;
  onHistoryClick?: () => void;
}

export function DoctorVisitTabs({ bookingId, className, onExit, onHistoryClick }: DoctorVisitTabsProps) {
  const t = useTranslations('emr.visit');
  const [record, setRecord] = useState<VisitResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('symptoms');

  const fetchRecord = useCallback(async () => {
    try {
      const data = await medicalRecordsApi.getVisitResults(bookingId);
      setRecord(data);
    } catch {
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void fetchRecord();
  }, [fetchRecord]);

  const handleRecordUpdated = useCallback((updated: VisitResultsResponse) => {
    setRecord(updated);
    setActiveTab((current) => {
      // Step 1 -> Step 2
      if (updated.visitStep === 'SYMPTOMS_TAKEN' && current === 'symptoms') return 'labOrders';
      // Step 2 & 3 are managed by skip/automated logic in their own tabs mostly
      // Step 4 -> Step 5
      if (updated.visitStep === 'DIAGNOSED' && current === 'diagnosis') return 'prescription';
      if (updated.visitStep === 'PRESCRIBED' && current === 'prescription') return 'summary';
      if (updated.visitStep === 'COMPLETED' && current === 'prescription') return 'summary';

      return current;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <SpinnerIcon size={28} className="animate-spin text-blue-500" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5 mx-auto', className)}>
      {/* Top Bar with Stepper */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-3 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-full gap-4">

        {onExit ? (
          <button onClick={onExit} className="shrink-0 text-[13px] font-semibold text-slate-500 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-700">
            <ArrowLeftIcon className="w-4 h-4" />
            {t('shared.back')}
          </button>
        ) : <div className="w-[84px] shrink-0" />}

        <div className="flex items-center gap-0 mx-auto overflow-x-auto hidden-scrollbar">
          {STEPS.map((s, idx) => {
            const activeStepIdx = STEPS.findIndex(step => step.tab === activeTab);
            const isCompleted = idx < activeStepIdx;
            const isActive = idx === activeStepIdx;
            const isOptional = s.step === 'SERVICES_ORDERED';

            let stateClass = '';
            let numClass = '';
            let labelClass = '';
            let lineClass = '';

            if (isCompleted) {
              stateClass = 'completed';
              numClass = 'bg-emerald-500 text-white shadow-sm';
              labelClass = 'text-emerald-600 font-semibold';
              lineClass = 'bg-emerald-500';
            } else if (isActive) {
              stateClass = 'active';
              if (isOptional) {
                numClass = 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] border-none';
                labelClass = 'text-indigo-600 font-bold';
              } else {
                numClass = 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] border-none';
                labelClass = 'text-indigo-600 font-bold';
              }
              lineClass = 'bg-gray-200';
            } else {
              // Pending
              if (isOptional) {
                numClass = 'bg-indigo-50 text-indigo-600 border-[1px] border-dashed border-indigo-400';
                labelClass = 'text-indigo-400 font-medium';
              } else {
                numClass = 'bg-slate-50 text-slate-400 border-[1px] border-slate-200';
                labelClass = 'text-slate-400 font-medium';
              }
              lineClass = 'bg-slate-200';
            }

            return (
              <div key={s.tab} className={cn('group flex items-center transition-all py-1', stateClass)}>
                <div className="flex items-center gap-2 px-2 py-1 relative">
                  {isOptional && !isCompleted && !isActive && (
                    <span className="absolute -top-1 -right-1 text-[9px] bg-indigo-100 text-indigo-600 px-1.5 rounded-full font-bold">
                      opt
                    </span>
                  )}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all',
                      numClass
                    )}
                  >
                    {isCompleted ? <span className="text-white">✓</span> : idx + 1}
                  </div>
                  <div className={cn('text-[13px] whitespace-nowrap hidden sm:block', labelClass)}>
                    {t(s.labelKey)}
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn('w-6 md:w-12 h-6 flex items-center justify-center shrink-0')}>
                    <div className={cn('w-full h-0.5 rounded-full transition-all', lineClass)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {onHistoryClick ? (
          <button onClick={onHistoryClick} className="shrink-0 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer">
            {t('historyTabButton')}
          </button>
        ) : <div className="w-[120px] shrink-0" />}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'symptoms' && (
          <SymptomsTab
            key={`symptoms-${bookingId}`}
            bookingId={bookingId}
            record={record}
            onSaved={handleRecordUpdated}
          />
        )}
        {activeTab === 'labOrders' && (
          <LabOrderTab
            key={`labOrders-${bookingId}`}
            bookingId={bookingId}
            onSaved={handleRecordUpdated}
            onSkip={() => setActiveTab('diagnosis')}
            onBack={() => setActiveTab('symptoms')}
          />
        )}
        {activeTab === 'diagnosis' && (
          <DiagnosisTab
            key={`diagnosis-${bookingId}`}
            bookingId={bookingId}
            record={record}
            onSaved={handleRecordUpdated}
            onBack={() => setActiveTab('labOrders')}
          />
        )}
        {activeTab === 'prescription' && (
          <PrescriptionTab
            key={`prescription-${bookingId}`}
            bookingId={bookingId}
            record={record}
            onSaved={handleRecordUpdated}
            onBack={() => setActiveTab('diagnosis')}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryTab
            key={`summary-${bookingId}`}
            record={record}
            onBack={() => setActiveTab('prescription')}
            onExit={onExit}
          />
        )}
      </div>
    </div>
  );
}
