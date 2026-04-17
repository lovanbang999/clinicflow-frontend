'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { InfoIcon, SpinnerIcon, ClipboardTextIcon } from '@phosphor-icons/react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { BookingStatus } from '@/types';
import { DoctorQueueCard } from './DoctorQueueCard';
import { DoctorStatsPanel } from './DoctorStatsPanel';
import { MedicalReport } from '@/components/doctor/tabs/summary/MedicalReport';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';

type FilterType = 'IN_EXAM' | 'WAITING_RESULTS' | BookingStatus.CHECKED_IN | BookingStatus.COMPLETED | BookingStatus.NO_SHOW;
type TaskTypeFilter = 'ALL' | 'CONSULTATION' | 'EXAMINATION';

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
  const stats = {
    inExam: queueItems.filter(q => q.booking.status === BookingStatus.IN_PROGRESS && (!q.booking.medicalRecord || q.isVisitServiceOrder)).length,
    waitingResults: queueItems.filter(q => (q.booking.status === BookingStatus.AWAITING_RESULTS || q.booking.status === BookingStatus.IN_PROGRESS) && q.booking.medicalRecord && !q.booking.medicalRecord.isFinalized && !q.isVisitServiceOrder).length,
    waiting: queueItems.filter(q => q.booking.status === BookingStatus.CHECKED_IN).length,
    completed: queueItems.filter(q => q.booking.status === BookingStatus.COMPLETED).length,
    noShow: queueItems.filter(q => q.booking.status === BookingStatus.NO_SHOW).length,
  };

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
      console.error('Failed to fetch full record for printing:', err);
    }
  };

  const filteredItems = queueItems.filter(q => {
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

  const isCheckedInTab = activeFilter === BookingStatus.CHECKED_IN;
  const hasResultsReady = filteredItems.some(item => item.booking.medicalRecord?.visitStep === 'RESULTS_READY');

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
        <div className="hidden print:block print:w-full print:h-auto print:bg-white text-black">
          <MedicalReport record={selectedPrintRecord} />
        </div>
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

interface QueueStatusTabsProps {
  active: FilterType;
  onChange: (id: FilterType) => void;
  stats: {
    waiting: number;
    inExam: number;
    waitingResults: number;
    completed: number;
    noShow: number;
  };
}

function QueueStatusTabs({ active, onChange, stats }: QueueStatusTabsProps) {
  const t = useTranslations('doctorWorkspace.queueView');
  const tabs = [
    { id: BookingStatus.CHECKED_IN, label: t('stats.waiting'), count: stats.waiting },
    { id: 'IN_EXAM', label: t('stats.inExam'), count: stats.inExam },
    { id: 'WAITING_RESULTS', label: t('stats.waitingResults'), count: stats.waitingResults },
    { id: BookingStatus.COMPLETED, label: t('stats.completed'), count: stats.completed },
    { id: BookingStatus.NO_SHOW, label: t('stats.noShow'), count: stats.noShow },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-[#f3f4f9] rounded-xl w-fit overflow-x-auto no-scrollbar border border-[#e2e2e9]">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => onChange(tab.id as FilterType)}
          className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
            active === tab.id ? 'bg-white shadow-md text-[#1275e2]' : 'text-[#44474e] hover:bg-white/50'
          }`}
        >
          {tab.label}
          <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold ${
            active === tab.id ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
          }`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

interface QueueTaskFiltersProps {
  active: TaskTypeFilter;
  onChange: (id: TaskTypeFilter) => void;
}

function QueueTaskFilters({ active, onChange }: QueueTaskFiltersProps) {
  const t = useTranslations('doctorWorkspace.queueView');
  const filters = [
    { id: 'ALL', label: t('filters.all', { defaultMessage: 'Tất cả' }) },
    { id: 'CONSULTATION', label: t('filters.consult', { defaultMessage: 'Tư vấn' }), color: '#185FA5' },
    { id: 'EXAMINATION', label: t('filters.exam', { defaultMessage: 'Chuyên khoa' }), color: '#7F77DD' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[#f3f4f9] rounded-xl border border-[#e2e2e9]">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id as TaskTypeFilter)}
          className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            active === f.id ? 'bg-white shadow-sm text-[#191c20] border border-[#e2e2e9]' : 'text-[#44474e] hover:bg-white/30'
          }`}
        >
          {f.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />}
          {f.label}
        </button>
      ))}
    </div>
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

interface GroupedQueueListProps {
  items: QueueRecord[];
  inExamCount: number;
  onCall: (id: string) => void;
  onEnterExam: (id: string) => void;
  onPrint: (item: QueueRecord) => void;
}

function GroupedQueueList({ items, inExamCount, onCall, onEnterExam, onPrint }: GroupedQueueListProps) {
  const resultsReady = items.filter((item) => item.booking.medicalRecord?.visitStep === 'RESULTS_READY');
  const otherWaiting = items.filter((item) => item.booking.medicalRecord?.visitStep !== 'RESULTS_READY');

  return (
    <div className="flex flex-col gap-4">
      {resultsReady.map((item) => (
        <DoctorQueueCard key={item.id} item={item} onCall={onCall} onEnterExam={onEnterExam} onPrint={() => onPrint(item)} />
      ))}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-[#e2e2e9]" />
        <span className="text-[10px] font-bold text-[#44474e]/40 uppercase tracking-widest">Danh sách chờ khám</span>
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
