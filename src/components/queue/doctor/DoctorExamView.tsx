'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { QueueRecord } from '@/lib/api/queue';
import { DoctorVisitTabs } from '@/components/doctor/DoctorVisitTabs';
import { DoctorHistoryTab } from './DoctorHistoryTab';
import { DoctorPatientBanner } from './DoctorPatientBanner';
import { DoctorVitalsStrip } from './DoctorVitalsStrip';
import { usePatientHistory } from '@/lib/hooks/usePatientHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, StethoscopeIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react';

interface DoctorExamViewProps {
  item: QueueRecord;
  onExit: () => void;
  onRefreshQueue?: () => void;
}

type TabId = 'exam' | 'hist';

export function DoctorExamView({ item, onExit, onRefreshQueue }: DoctorExamViewProps) {
  const t = useTranslations('doctorWorkspace.examView');
  const [activeTab, setActiveTab] = useState<TabId>('exam');
  const { history, isLoading: isHistoryLoading } = usePatientHistory(item.booking.patientProfileId);

  const tabs: { id: TabId; label: string, icon: React.ReactNode }[] = [
    { id: 'exam', label: t('mainTabs.exam'), icon: <StethoscopeIcon size={16} weight="bold" /> },
    { id: 'hist', label: t('mainTabs.history'), icon: <ClockCounterClockwiseIcon size={16} weight="bold" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] overflow-hidden" id="exam-mode">
      <main className="flex-1 overflow-y-auto p-6 pb-10" style={{ scrollbarWidth: 'thin' }}>

        {/* Patient Banner */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
          <DoctorPatientBanner item={item} />
          <DoctorVitalsStrip item={item} />
        </section>

        {/* Top tab nav */}
        <div className="flex items-center gap-2 mb-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onRefreshQueue?.(); onExit(); }}
            className="gap-1 text-gray-500 hover:text-gray-700 -ml-1"
          >
            <ArrowLeftIcon size={16} />
            {t('back')}
          </Button>
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 ml-auto shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-blue-600 border border-gray-200/50 ring-1 ring-black/5'
                    : 'hover:bg-gray-200/50 text-gray-500 cursor-pointer'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={activeTab === 'exam' ? 'block animate-in fade-in duration-200' : 'hidden'}>
          <DoctorVisitTabs bookingId={item.booking.id} />
        </div>

        <div className={activeTab === 'hist' ? 'block animate-in fade-in duration-200' : 'hidden'}>
          <DoctorHistoryTab history={history} isLoading={isHistoryLoading} />
        </div>
      </main>
    </div>
  );
}
