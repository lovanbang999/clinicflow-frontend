'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { DoctorVisitTabs } from '@/components/doctor/DoctorVisitTabs';
import { DoctorHistoryTab } from './DoctorHistoryTab';
import { DoctorPatientBanner } from './DoctorPatientBanner';
import { DoctorVitalsStrip } from './DoctorVitalsStrip';
import { usePatientHistory } from '@/lib/hooks/clinical/usePatientHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface DoctorExamViewProps {
  item: QueueRecord;
  onExit: () => void;
  onRefreshQueue?: () => void;
}

type TabId = 'exam' | 'hist';

export function DoctorExamView({ item, onExit, onRefreshQueue }: DoctorExamViewProps) {
  const t = useTranslations('emr.visit');
  const [activeTab, setActiveTab] = useState<TabId>('exam');
  const { history, isLoading: isHistoryLoading } = usePatientHistory(item.booking.patientProfile?.id || item.booking.patientProfileId);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] overflow-hidden" id="exam-mode">
      <main className="flex-1 overflow-y-auto p-6 pb-0" style={{ scrollbarWidth: 'thin' }}>

        {/* Patient Banner */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
          <DoctorPatientBanner item={item} />
          <DoctorVitalsStrip item={item} />
        </section>

        {/* Content */}
        <div className={activeTab === 'exam' ? 'block animate-in fade-in duration-200' : 'hidden'}>
          <DoctorVisitTabs 
            bookingId={item.booking.id} 
            onExit={() => { onRefreshQueue?.(); onExit(); }}
            onHistoryClick={() => setActiveTab('hist')}
          />
        </div>

        <div className={activeTab === 'hist' ? 'block animate-in fade-in duration-200 pb-10' : 'hidden'}>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('exam')}
              className="gap-1 text-gray-500 hover:text-gray-700 -ml-1"
            >
              <ArrowLeftIcon size={16} /> {t('backToExam')}
            </Button>
          </div>
          <DoctorHistoryTab
            history={history}
            isLoading={isHistoryLoading}
          />
        </div>
      </main>
    </div>
  );
}
