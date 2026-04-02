'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type VisitResultsResponse, type VisitStep } from '@/lib/api/medical-records';
import { SymptomsTab } from './tabs/SymptomsTab';
import { LabOrderTab } from './tabs/LabOrderTab';
import { DiagnosisTab } from './tabs/DiagnosisTab';
import { PrescriptionTab } from './tabs/PrescriptionTab';
import { VisitStepBadge } from './shared/VisitStepBadge';
import { SpinnerIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { LockIcon } from 'lucide-react';

// Ordered steps for progress indicator
const STEPS: { step: VisitStep; labelKey: string; tab: TabId }[] = [
  { step: 'SYMPTOMS_TAKEN',   labelKey: 'stepLabels.symptoms', tab: 'symptoms' },
  { step: 'SERVICES_ORDERED', labelKey: 'stepLabels.services', tab: 'labOrders' },
  { step: 'RESULTS_READY',    labelKey: 'stepLabels.results', tab: 'diagnosis' },
  { step: 'COMPLETED',        labelKey: 'stepLabels.prescription', tab: 'prescription' },
];

type TabId = 'symptoms' | 'labOrders' | 'diagnosis' | 'prescription';

const STEP_ORDER: VisitStep[] = [
  'SYMPTOMS_TAKEN',
  'SERVICES_ORDERED',
  'AWAITING_RESULTS',
  'RESULTS_READY',
  'DIAGNOSED',
  'PRESCRIBED',
  'COMPLETED',
];

function stepIndex(s: VisitStep) {
  return STEP_ORDER.indexOf(s);
}

/** Returns the tab that should be unlocked based on visitStep */
function unlockedTabs(step: VisitStep): Set<TabId> {
  const idx = stepIndex(step);
  const unlocked = new Set<TabId>(['symptoms']); // always unlocked
  if (idx >= stepIndex('SYMPTOMS_TAKEN')) {
    unlocked.add('labOrders');
    unlocked.add('diagnosis');
  }
  if (idx >= stepIndex('DIAGNOSED')) unlocked.add('prescription');
  return unlocked;
}

interface DoctorVisitTabsProps {
  bookingId: string;
  className?: string;
}

export function DoctorVisitTabs({ bookingId, className }: DoctorVisitTabsProps) {
  const t = useTranslations('dashboard.doctor.workspace.visit');
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
      if (updated.visitStep === 'SYMPTOMS_TAKEN' && current === 'symptoms') return 'labOrders';
      if (updated.visitStep === 'DIAGNOSED' && current === 'diagnosis') return 'prescription';
      return current;
    });
  }, []);

  const currentStep = record?.visitStep ?? 'SYMPTOMS_TAKEN';
  const allowed = record ? unlockedTabs(record.visitStep) : new Set<TabId>(['symptoms']);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'symptoms',     label: t('tabLabels.symptoms') },
    { id: 'labOrders',    label: t('tabLabels.services') },
    { id: 'diagnosis',    label: t('tabLabels.diagnosis') },
    { id: 'prescription', label: t('tabLabels.prescription') },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <SpinnerIcon size={28} className="animate-spin text-blue-500" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Step indicator */}
      <div className="flex items-center gap-1 flex-wrap">
        {record && <VisitStepBadge step={currentStep} size="md" />}
        <div className="ml-auto flex items-center gap-0.5">
          {STEPS.map((s, idx) => {
            const passed = stepIndex(currentStep) >= stepIndex(s.step);
            return (
              <div key={s.step} className="group relative flex items-center gap-0.5">
                {idx > 0 && <div className={cn('w-10 h-0.5 rounded', passed ? 'bg-blue-400' : 'bg-gray-200')} />}
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all cursor-default',
                    passed
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400',
                  )}
                >
                  {idx + 1}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 transition-all">
                  {t(s.labelKey)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap items-center gap-1 bg-gray-100/80 p-1.5 rounded-xl w-fit shadow-sm border border-gray-200/50">
        {tabs.map((tab) => {
          const locked = !allowed.has(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => !locked && setActiveTab(tab.id)}
              disabled={locked}
              title={locked ? t('unlockTitle') : undefined}
              className={cn(
                'px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2',
                activeTab === tab.id && !locked
                  ? 'bg-white shadow-sm text-blue-600 border border-gray-200/50 ring-1 ring-black/5'
                  : locked
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'hover:bg-gray-200/50 text-gray-500 cursor-pointer',
              )}
            >
              {tab.label}
              {locked && <LockIcon size={14} />}
            </button>
          );
        })}
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
            record={record}
            onSaved={handleRecordUpdated}
          />
        )}
        {activeTab === 'diagnosis' && (
          <DiagnosisTab
            key={`diagnosis-${bookingId}`}
            bookingId={bookingId}
            record={record}
            onSaved={handleRecordUpdated}
          />
        )}
        {activeTab === 'prescription' && (
          <PrescriptionTab
            key={`prescription-${bookingId}`}
            bookingId={bookingId}
            record={record}
            onSaved={handleRecordUpdated}
          />
        )}
      </div>
    </div>
  );
}
