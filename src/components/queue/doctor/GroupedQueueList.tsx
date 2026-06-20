'use client';

import { useTranslations } from 'next-intl';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { DoctorQueueCard } from './DoctorQueueCard';

interface GroupedQueueListProps {
  items: QueueRecord[];
  inExamCount: number;
  onCall: (id: string) => void;
  onEnterExam: (id: string) => void;
  onPrint: (item: QueueRecord) => void;
}

export function GroupedQueueList({
  items,
  inExamCount,
  onCall,
  onEnterExam,
  onPrint,
}: GroupedQueueListProps) {
  const t = useTranslations('doctorWorkspace.queueView');
  const resultsReady = items.filter((item) => item.booking.medicalRecord?.visitStep === 'RESULTS_READY');
  const otherWaiting = items.filter((item) => item.booking.medicalRecord?.visitStep !== 'RESULTS_READY');

  return (
    <div className="flex flex-col gap-4">
      {resultsReady.map((item) => (
        <DoctorQueueCard
          key={item.id}
          item={item}
          onCall={onCall}
          onEnterExam={onEnterExam}
          onPrint={() => onPrint(item)}
        />
      ))}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-[#e2e2e9]" />
        <span className="text-[10px] font-bold text-[#44474e]/40 uppercase tracking-widest">
          {t('statsPanel.waitingListHeader')}
        </span>
        <div className="h-px flex-1 bg-[#e2e2e9]" />
      </div>
      {otherWaiting.map((item, index) => (
        <DoctorQueueCard
          key={item.id}
          item={item}
          onCall={onCall}
          onEnterExam={onEnterExam}
          onPrint={() => onPrint(item)}
          isCallDisabled={inExamCount > 0 || index > 0}
        />
      ))}
    </div>
  );
}
