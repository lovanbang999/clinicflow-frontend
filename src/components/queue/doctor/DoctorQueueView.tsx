'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { InfoIcon, SpinnerIcon, ClipboardTextIcon } from '@phosphor-icons/react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { BookingStatus } from '@/types';
import { DoctorQueueCard } from './DoctorQueueCard';
import { DoctorStatsPanel } from './DoctorStatsPanel';
import { MedicalReport } from '@/components/doctor/tabs/summary/MedicalReport';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { QueueStatusTabs, type FilterType } from './QueueStatusTabs';
import { QueueTaskFilters, type TaskTypeFilter } from './QueueTaskFilters';
import { GroupedQueueList } from './GroupedQueueList';


interface DoctorQueueViewProps {
  queueItems: QueueRecord[];
  isLoading: boolean;
  isConnected: boolean;
  onCallPatient: (bookingId: string) => void;
  onEnterExam: (bookingId: string) => void;
  roomLabel?: string;
  avgWaitMins?: number;
}

export function DoctorQueueView({
  queueItems,
  isLoading,
  isConnected,
  onCallPatient,
  onEnterExam,
  avgWaitMins = 0,
}: DoctorQueueViewProps) {
  const t = useTranslations('doctorWorkspace.queueView');

  // Logic for counts
  const stats = useMemo(() => ({
    inExam: queueItems.filter(q => q.booking.status === BookingStatus.IN_PROGRESS && (!q.booking.medicalRecord || q.isVisitServiceOrder)).length,
    waitingResults: queueItems.filter(q => (q.booking.status === BookingStatus.AWAITING_RESULTS || q.booking.status === BookingStatus.IN_PROGRESS) && q.booking.medicalRecord && !q.booking.medicalRecord.isFinalized && !q.isVisitServiceOrder).length,
    waiting: queueItems.filter(q => q.booking.status === BookingStatus.CHECKED_IN).length,
    completed: queueItems.filter(q => q.booking.status === BookingStatus.COMPLETED).length,
    noShow: queueItems.filter(q => q.booking.status === BookingStatus.NO_SHOW).length,
  }), [queueItems]);

  const [activeFilter, setActiveFilter] = useState<FilterType>(BookingStatus.CHECKED_IN);
  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskTypeFilter>('ALL');
  const [selectedPrintRecord, setSelectedPrintRecord] = useState<VisitResultsResponse | null>(null);

  const handleDirectPrint = async (record: QueueRecord) => {
    try {
      const fullRecord = await medicalRecordsApi.getVisitResults(record.bookingId);
      setSelectedPrintRecord(fullRecord);
      setTimeout(() => {
        window.print();
        setTimeout(() => setSelectedPrintRecord(null), 1000);
      }, 500);
    } catch (err) {
      void err;
    }
  };

  const filteredItems = useMemo(() => {
    return queueItems.filter(q => {
      let statusMatch = false;
      if (activeFilter === 'IN_EXAM') {
        statusMatch = q.booking.status === BookingStatus.IN_PROGRESS && (!q.booking.medicalRecord || !!q.isVisitServiceOrder);
      } else if (activeFilter === 'WAITING_RESULTS') {
        statusMatch = (q.booking.status === BookingStatus.AWAITING_RESULTS || q.booking.status === BookingStatus.IN_PROGRESS) &&
          !!q.booking.medicalRecord && !q.booking.medicalRecord?.isFinalized && !q.isVisitServiceOrder;
      } else {
        statusMatch = q.booking.status === activeFilter as BookingStatus;
      }

      if (!statusMatch) return false;

      if (taskTypeFilter === 'CONSULTATION') return !q.isVisitServiceOrder;
      if (taskTypeFilter === 'EXAMINATION') return !!q.isVisitServiceOrder;
      return true;
    });
  }, [queueItems, activeFilter, taskTypeFilter]);

  const isCheckedInTab = activeFilter === BookingStatus.CHECKED_IN;
  const hasResultsReady = useMemo(() => {
    return filteredItems.some(item => item.booking.medicalRecord?.visitStep === 'RESULTS_READY');
  }, [filteredItems]);


  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#f8f9ff] text-[#191c20] overflow-y-auto no-scrollbar print:overflow-visible print:h-auto print:bg-white" id="queue-mode">
      <div className="p-8 mx-auto w-full print:hidden">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="font-extrabold text-2xl text-[#191c20] tracking-tight">{t('title')}</h3>
                {isConnected && <ConnectionBadge label={t('live')} />}
              </div>

              <DoctorStatsPanel avgWaitMins={avgWaitMins} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                <QueueStatusTabs active={activeFilter} onChange={setActiveFilter} stats={stats} />
                <QueueTaskFilters active={taskTypeFilter} onChange={setTaskTypeFilter} />
              </div>
            </div>
          </div>
        </section>


        <div className="space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : filteredItems.length === 0 ? (
            <EmptyState message={t('emptyTab')} />
          ) : (
            <div className="flex flex-col gap-4">
              {isCheckedInTab && hasResultsReady ? (
                <GroupedQueueList
                  items={filteredItems}
                  inExamCount={stats.inExam}
                  onCall={onCallPatient}
                  onEnterExam={onEnterExam}
                  onPrint={handleDirectPrint}
                />
              ) : (
                filteredItems.map((item, index) => (
                  <DoctorQueueCard
                    key={item.id}
                    item={item}
                    onCall={onCallPatient}
                    onEnterExam={onEnterExam}
                    onPrint={() => handleDirectPrint(item)}
                    isCallDisabled={stats.inExam > 0 || (isCheckedInTab && index > 0)}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {isCheckedInTab && filteredItems.length > 0 && <InfoNote />}
      </div>

      {selectedPrintRecord && (
        <MedicalReport record={selectedPrintRecord} />
      )}
    </div>
  );
}

function ConnectionBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#dcfce7] text-[#15803d] text-[10px] font-bold tracking-wider uppercase border border-[#bbf7d0]">
      <span className="w-1.5 h-1.5 bg-[#15803d] rounded-full animate-pulse"></span>
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="border-2 border-dashed border-[#c4c6cf]/30 rounded-2xl py-20 flex flex-col items-center justify-center text-[#44474e] bg-white/50">
      <SpinnerIcon size={40} className="animate-spin text-[#1275e2] mb-3" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-2 border-dashed border-[#c4c6cf]/30 rounded-2xl py-20 flex items-center justify-center text-[#44474e]/50 bg-white/50">
      <div className="flex flex-col items-center">
        <ClipboardTextIcon size={56} className="mb-4 opacity-20" />
        <p className="text-sm font-bold tracking-tight">{message}</p>
      </div>
    </div>
  );
}

function InfoNote() {
  const t = useTranslations('doctorWorkspace.queueView');
  return (
    <div className="mt-12 bg-[#1275e2]/5 p-6 rounded-2xl flex items-start gap-4 border border-[#1275e2]/10">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1275e2] shrink-0 shadow-sm border border-[#1275e2]/10">
        <InfoIcon size={22} weight="fill" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#191c20] leading-relaxed">
          {t.rich('infoNote', {
            strong: (chunks) => <span className="font-bold text-[#1275e2] underline underline-offset-4 decoration-[#1275e2]/30">{chunks}</span>,
          })}
        </p>
      </div>
    </div>
  );
}
