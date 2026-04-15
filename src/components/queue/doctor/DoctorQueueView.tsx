'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { InfoIcon, SpinnerIcon, TimerIcon, ClipboardTextIcon } from '@phosphor-icons/react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { BookingStatus } from '@/types';
import { DoctorQueueCard } from './DoctorQueueCard';
import { DoctorStatsPanel } from './DoctorStatsPanel';
import { MedicalReport } from '@/components/doctor/tabs/summary/MedicalReport';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';

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

  const inExam = queueItems.filter((q) => 
    q.booking.status === BookingStatus.IN_PROGRESS && (!q.booking.medicalRecord || q.isVisitServiceOrder)
  ).length;

  const waitingResults = queueItems.filter((q) => 
    (q.booking.status === BookingStatus.AWAITING_RESULTS || q.booking.status === BookingStatus.IN_PROGRESS) && 
    q.booking.medicalRecord && !q.booking.medicalRecord.isFinalized && !q.isVisitServiceOrder
  ).length;

  const waiting = queueItems.filter((q) => q.booking.status === BookingStatus.CHECKED_IN).length;
  const completed = queueItems.filter((q) => q.booking.status === BookingStatus.COMPLETED).length;
  const noShow = queueItems.filter((q) => q.booking.status === BookingStatus.NO_SHOW).length;

  type FilterType = 'IN_EXAM' | 'WAITING_RESULTS' | BookingStatus.CHECKED_IN | BookingStatus.COMPLETED | BookingStatus.NO_SHOW;
  const [activeFilter, setActiveFilter] = useState<FilterType>(BookingStatus.CHECKED_IN);
  const [selectedPrintRecord, setSelectedPrintRecord] = useState<VisitResultsResponse | null>(null);

  const handleDirectPrint = async (record: QueueRecord) => {
    try {
      // Fetch the full visit results to populate the premium MedicalReport correctly
      const fullRecord = await medicalRecordsApi.getVisitResults(record.bookingId);
      setSelectedPrintRecord(fullRecord);
      
      // Give time for state to update and component to render
      setTimeout(() => {
        window.print();
        // Clean up after print (though hidden in UI, good for state)
        setTimeout(() => setSelectedPrintRecord(null), 1000);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch full record for printing:', err);
    }
  };

  const filteredItems = activeFilter === 'IN_EXAM'
      ? queueItems.filter(q => q.booking.status === BookingStatus.IN_PROGRESS && (!q.booking.medicalRecord || q.isVisitServiceOrder))
      : activeFilter === 'WAITING_RESULTS'
        ? queueItems.filter(q => (q.booking.status === BookingStatus.AWAITING_RESULTS || q.booking.status === BookingStatus.IN_PROGRESS) && q.booking.medicalRecord && !q.booking.medicalRecord.isFinalized && !q.isVisitServiceOrder)
        : queueItems.filter(q => q.booking.status === activeFilter as BookingStatus);

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#f8f9ff] text-[#191c20] overflow-y-auto no-scrollbar print:overflow-visible print:h-auto print:bg-white" id="queue-mode">
      <div className="p-8 mx-auto w-full print:hidden">
        {/* Header & Stats */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-extrabold text-2xl text-[#191c20] tracking-tight">{t('title')}</h3>
                {isConnected && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(0,108,75,0.1)] text-[#006c4b] text-[10px] font-bold tracking-wider uppercase border border-[rgba(0,108,75,0.2)]">
                    <span className="w-1.5 h-1.5 bg-[#006c4b] rounded-full animate-pulse"></span>
                    {t('live')}
                  </span>
                )}
              </div>
              
              <DoctorStatsPanel />

              {/* Filters / Stats pills */}
              <div className="flex items-center gap-2 p-1 bg-[#f3f4f9] rounded-lg w-fit overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveFilter(BookingStatus.CHECKED_IN)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                    activeFilter === BookingStatus.CHECKED_IN ? 'bg-white shadow-sm text-[#1275e2] font-bold' : 'text-[#44474e] hover:bg-gray-200/50'
                  }`}
                >
                  {t('stats.waiting')}
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] ${
                    activeFilter === BookingStatus.CHECKED_IN ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
                  }`}>
                    {waiting}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveFilter('IN_EXAM')}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                    activeFilter === 'IN_EXAM' ? 'bg-white shadow-sm text-[#1275e2] font-bold' : 'text-[#44474e] hover:bg-gray-200/50'
                  }`}
                >
                  {t('stats.inExam', { defaultMessage: 'Đang khám' })}
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] ${
                    activeFilter === 'IN_EXAM' ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
                  }`}>
                    {inExam}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveFilter('WAITING_RESULTS')}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                    activeFilter === 'WAITING_RESULTS' ? 'bg-white shadow-sm text-[#1275e2] font-bold' : 'text-[#44474e] hover:bg-gray-200/50'
                  }`}
                >
                  {t('stats.waitingResults', { defaultMessage: 'Chờ kết quả' })}
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] ${
                    activeFilter === 'WAITING_RESULTS' ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
                  }`}>
                    {waitingResults}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveFilter(BookingStatus.COMPLETED)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                    activeFilter === BookingStatus.COMPLETED ? 'bg-white shadow-sm text-[#1275e2] font-bold' : 'text-[#44474e] hover:bg-gray-200/50'
                  }`}
                >
                  {t('stats.completed')}
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] ${
                    activeFilter === BookingStatus.COMPLETED ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
                  }`}>
                    {completed}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveFilter(BookingStatus.NO_SHOW)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                    activeFilter === BookingStatus.NO_SHOW ? 'bg-white shadow-sm text-[#1275e2] font-bold' : 'text-[#44474e] hover:bg-gray-200/50'
                  }`}
                >
                  {t('stats.noShow')}
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] ${
                    activeFilter === BookingStatus.NO_SHOW ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
                  }`}>
                    {noShow}
                  </span>
                </button>
              </div>
            </div>

            {/* Wait time box */}
            <div className="bg-white px-6 py-4 rounded-xl border border-[#c4c6cf]/20 flex items-center gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-lg bg-[#e0efff] flex items-center justify-center text-[#1275e2]">
                <TimerIcon size={24} weight="fill" />
              </div>
              <div>
                <p className="text-[10px] text-[#44474e] font-bold uppercase tracking-widest leading-tight mb-0.5">
                  {t('avgWaitTime')}
                </p>
                <p className="text-xl font-black text-[#191c20] leading-none">
                  {avgWaitMins} {t('minutes')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* List of patients */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="border-2 border-dashed border-[#c4c6cf]/30 rounded-xl py-12 flex flex-col items-center justify-center text-[#44474e] bg-[#f3f4f9]/30">
              <SpinnerIcon size={40} className="animate-spin text-[#1275e2] mb-3" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="border-2 border-dashed border-[#c4c6cf]/30 rounded-xl py-12 flex items-center justify-center text-[#44474e]/50 bg-[#f3f4f9]/30">
              <div className="flex flex-col items-center">
                <ClipboardTextIcon size={48} className="mb-3 opacity-30" />
                <p className="text-sm font-semibold tracking-tight">{t('emptyTab')}</p>
              </div>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <DoctorQueueCard
                key={item.id}
                item={item}
                onCall={onCallPatient}
                onEnterExam={onEnterExam}
                onPrint={() => handleDirectPrint(item)}
                isCallDisabled={inExam > 0 || (activeFilter === BookingStatus.CHECKED_IN && index > 0)}
              />
            ))
          )}
        </div>

        {/* Footer info note */}
        {queueItems.length > 0 && (
          <div className="mt-12 bg-[#e0efff]/30 p-5 rounded-xl flex items-start gap-4 border border-[#1275e2]/10">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#1275e2] shrink-0 shadow-sm border border-[#1275e2]/10">
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
        )}
      </div>

      {/* Hidden printing component */}
      {selectedPrintRecord && (
        <div className="hidden print:block print:w-full print:h-auto print:bg-white text-black">
          <MedicalReport record={selectedPrintRecord} />
        </div>
      )}
    </div>
  );
}
