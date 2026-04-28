'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApiData } from '@/lib/hooks/core/useApiData';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { StethoscopeIcon } from '@phosphor-icons/react';
import { 
  ChevronDown, Stethoscope, Image as ImageIcon
} from 'lucide-react';


export interface PatientHistoryItem {
  id: string;
  createdAt: string;
  visitStep: string;
  diagnosisName?: string;
  diagnosisCode?: string;
  treatmentPlan?: string;
  chiefComplaint?: string;
  heartRate?: string;
  bloodPressure?: string;
  temperature?: string;
  spO2?: string;
  booking?: {
    status?: string;
    bookingDate?: string;
    service?: { name: string };
    doctor?: { fullName: string };
  };
  prescription?: {
    items?: { medicineName: string; dosage: string; frequency: string; quantity: number; unit: string; durationDays?: number; }[];
  };
  visitServiceOrders?: { id: string; status: string; resultText?: string; resultFileUrl?: string; service?: { name: string } }[];
}

type FilterStatus = 'ALL' | 'COMPLETED' | 'PENDING' | 'CANCELLED';

const FilterChip = ({ label, value, activeFilter, setActiveFilter }: { label: string; value: FilterStatus; activeFilter: FilterStatus; setActiveFilter: (v: FilterStatus) => void }) => (
  <button
    onClick={() => setActiveFilter(value)}
    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 md:px-5 md:py-2 text-[11px] md:text-[13px] font-semibold border transition-colors ${
      activeFilter === value
        ? 'bg-blue-600 border-blue-600 text-white'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    {label}
  </button>
);

export default function PatientMedicalHistoryPage() {
  const t = useTranslations('patientOverview.medicalHistory');
  const tGreeting = useTranslations('booking');
  const tEmr = useTranslations('emr');
  const locale = useLocale();

  const hour = new Date().getHours();
  let greetingKey = 'pageGreetingMorning';
  if (hour >= 12 && hour < 18) greetingKey = 'pageGreetingAfternoon';
  else if (hour >= 18 || hour < 5) greetingKey = 'pageGreetingEvening';
  
  const { data, isLoading } = useApiData(() => medicalRecordsApi.getMyVisits(1, 50), null);
  const rawVisits = useMemo(() => data?.visits || [], [data?.visits]);

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(rawVisits[0]?.id || null);

  const filteredVisits = useMemo(() => {
    return rawVisits.filter((v: PatientHistoryItem) => {
      const bookingStatus = v.booking?.status || 'COMPLETED';
      if (activeFilter === 'COMPLETED') return bookingStatus === 'COMPLETED' || v.visitStep === 'COMPLETED';
      if (activeFilter === 'CANCELLED') return bookingStatus === 'CANCELLED';
      if (activeFilter === 'PENDING') return !['COMPLETED', 'CANCELLED'].includes(bookingStatus) && v.visitStep !== 'COMPLETED';
      return true; // ALL
    });
  }, [rawVisits, activeFilter]);

  const groupedVisits = useMemo(() => {
    const groups: Record<string, PatientHistoryItem[]> = {};
    filteredVisits.forEach((v: PatientHistoryItem) => {
      const d = new Date(v.createdAt);
      if (!isValid(d)) return;
      const monthKey = locale === 'vi' 
        ? `Tháng ${format(d, 'M')} · ${format(d, 'yyyy')}`
        : format(d, 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(v);
    });
    return groups;
  }, [filteredVisits, locale]);

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (!isValid(d)) return '—';
    return format(d, 'dd/MM/yyyy · HH:mm', { locale: locale === 'vi' ? vi : undefined });
  };

  const StepIndicator = ({ done, current, isRed }: { done: boolean, current?: boolean, isRed?: boolean }) => (
    <div className={`absolute -left-[26.5px] top-1 w-3 h-3 rounded-full border-2 bg-white flex items-center justify-center z-10
      ${isRed ? 'border-red-500 bg-red-100' : done ? 'border-blue-600 bg-blue-600' : current ? 'border-amber-500 bg-amber-100' : 'border-slate-300 dark:border-slate-700 dark:bg-slate-900'}
    `}>
      {done && !isRed && <div className="w-1 h-1 rounded-full bg-white" />}
    </div>
  );

  const renderVisitTimeline = (visit: PatientHistoryItem) => {
    const bookingDate = visit.booking?.bookingDate || visit.createdAt;
    const checkInTime = new Date(new Date(bookingDate).getTime() + 15 * 60000).toISOString();
    const symptomsTime = visit.createdAt;
    const isCancelled = visit.booking?.status === 'CANCELLED';

    return (
      <div className="pt-3 pb-2 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="relative pl-5 border-l border-slate-200 dark:border-slate-700 space-y-4 mt-2 mb-2 ml-1">
          
          {/* Step 1: Booking */}
          <div className="relative mb-4">
            <StepIndicator done={true} />
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-slate-200">{tEmr('history.timeline.booking')}</span>
              <span className="text-[11px] md:text-[12px] text-slate-500">{formatDateTime(bookingDate)}</span>
            </div>
            <div className="text-[12px] md:text-[13px] text-slate-600 dark:text-slate-400">
              <span className="inline-block rounded-md px-1.5 py-0.5 text-[10px] md:text-[11px] font-semibold mr-1 mt-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Online</span>
            </div>
          </div>

          {isCancelled ? (
            <div className="relative mb-2">
              <StepIndicator done={true} isRed={true} />
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[13px] font-semibold text-red-700 dark:text-red-400">{tEmr('history.timeline.transactionEnded')}</span>
              </div>
              <div className="text-[12px] text-slate-600 dark:text-slate-400">
                <span className="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold mr-1 mt-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Huỷ</span>
              </div>
            </div>
          ) : (
            <>
              {/* Step 2: Check-in */}
              <div className="relative mb-4">
                <StepIndicator done={true} />
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-slate-200">{tEmr('history.timeline.checkIn')}</span>
                  <span className="text-[11px] md:text-[12px] text-slate-500">{formatDateTime(checkInTime)}</span>
                </div>
                <div className="text-[12px] md:text-[13px] text-slate-600 dark:text-slate-400">{tEmr('history.timeline.checkInDesc')}</div>
              </div>

              {/* Step 3: Symptoms */}
              <div className="relative mb-4">
                <StepIndicator done={!!visit.chiefComplaint} current={!visit.chiefComplaint} />
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-slate-200">{tEmr('history.timeline.symptoms')}</span>
                  <span className="text-[11px] md:text-[12px] text-slate-500">{formatDateTime(symptomsTime)}</span>
                </div>
                {(visit.chiefComplaint || visit.bloodPressure) && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 md:p-3.5 mt-1.5 text-[12px] md:text-[14px]">
                    {visit.chiefComplaint && (
                      <div className="text-slate-900 dark:text-white mb-1.5">{visit.chiefComplaint}</div>
                    )}
                    {(visit.heartRate || visit.bloodPressure || visit.temperature || visit.spO2) && (
                      <div className="flex gap-1.5 md:gap-2 mt-2 md:mt-3 flex-wrap">
                        {visit.heartRate && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md px-2 py-1 text-[11px] md:text-[12px] font-medium border border-blue-100 dark:border-blue-800">Mạch {visit.heartRate} bpm</span>}
                        {visit.bloodPressure && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md px-2 py-1 text-[11px] md:text-[12px] font-medium border border-blue-100 dark:border-blue-800">HA {visit.bloodPressure}</span>}
                        {visit.temperature && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md px-2 py-1 text-[11px] md:text-[12px] font-medium border border-blue-100 dark:border-blue-800">{visit.temperature}°C</span>}
                        {visit.spO2 && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md px-2 py-1 text-[11px] md:text-[12px] font-medium border border-blue-100 dark:border-blue-800">SpO2 {visit.spO2}%</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4 & 5: Services */}
              {visit.visitServiceOrders && visit.visitServiceOrders.length > 0 && (
                <div className="relative mb-4">
                  <StepIndicator done={visit.visitServiceOrders.every(o => o.status === 'COMPLETED')} />
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-slate-200">{tEmr('history.timeline.laboratory')}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 md:p-3.5 mt-1.5 text-[12px] md:text-[14px] space-y-1 md:space-y-1.5">
                    {visit.visitServiceOrders.map(order => (
                      <div key={order.id} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <span className="text-slate-500 line-clamp-1 flex-1 pr-2">{order.service?.name}</span>
                        {order.status === 'COMPLETED' ? (
                          order.resultText ? (
                            <span className="text-slate-900 dark:text-white font-medium text-right max-w-[50%] truncate flex items-center gap-1 md:gap-1.5">
                              {order.resultText}
                              {order.resultFileUrl && <ImageIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />}
                            </span>
                          ) : (
                            <span className="inline-block rounded-md px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 m-0">Xong</span>
                          )
                        ) : (
                          <span className="inline-block rounded-md px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 m-0">Đang đợi</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Diagnosis */}
              <div className="relative mb-4">
                <StepIndicator done={!!visit.diagnosisName} />
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-slate-200">{tEmr('history.timeline.diagnosis')}</span>
                </div>
                {visit.diagnosisName && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 md:p-3.5 mt-1.5 text-[12px] md:text-[14px]">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                      <span className="text-slate-500">ICD-10</span>
                      {visit.diagnosisCode && (
                        <span className="inline-block rounded-md px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 m-0">{visit.diagnosisCode}</span>
                      )}
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium text-sm md:text-[15px]">
                      {visit.diagnosisName}
                    </div>
                    {visit.treatmentPlan && (
                      <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-100 dark:border-slate-800 line-clamp-3">
                        {visit.treatmentPlan}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 7: Prescription */}
              <div className="relative mb-2">
                <StepIndicator done={!!(visit.prescription?.items && visit.prescription.items.length > 0)} />
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-slate-200">{tEmr('history.timeline.prescription')}</span>
                </div>
                {visit.prescription?.items && visit.prescription.items.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 md:p-3.5 mt-1.5 text-[12px] md:text-[14px]">
                    {visit.prescription.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 md:py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <div className="flex flex-col">
                          <span className="text-slate-500">{item.medicineName}</span>
                          <span className="text-[10px] md:text-[12px] text-slate-400 mt-0.5">{item.dosage} · {item.frequency}</span>
                        </div>
                        <span className="text-slate-900 dark:text-white font-medium text-right ml-3">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    );
  };

// Extracted FilterChip

  return (
    <div className="max-w-3xl mx-auto p-2 space-y-6">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-[#1392ec] font-bold uppercase tracking-wider">{tGreeting(greetingKey)}</p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t('title')}</h1>
        <p className="text-[13px] text-slate-500 font-medium">
          {rawVisits.length > 0
            ? t('subtitle', { count: rawVisits.length })
            : t('noHistory')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : rawVisits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm px-6">
          <div className="size-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <StethoscopeIcon size={40} className="text-slate-300 dark:text-slate-600" weight="duotone" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t('emptyTitle')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed mx-auto">{t('emptyDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0">
          <div className="flex gap-2 px-4 sm:px-0 overflow-x-auto pb-4 scrollbar-hide">
            <FilterChip label="Tất cả" value="ALL" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterChip label="Hoàn thành" value="COMPLETED" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterChip label="Đang chờ" value="PENDING" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterChip label="Đã huỷ" value="CANCELLED" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          </div>

          <div className="px-4 sm:px-0 pt-2 pb-6 space-y-6">
            {Object.keys(groupedVisits).map((monthKey) => (
              <div key={monthKey}>
                <div className="text-[11px] text-slate-500 font-semibold mb-3 uppercase tracking-wider pl-0.5">
                  {monthKey}
                </div>
                
                {groupedVisits[monthKey].map(visit => {
                  const isExpanded = expandedVisitId === visit.id;
                  const isCancelled = visit.booking?.status === 'CANCELLED';
                  const isCompleted = visit.visitStep === 'COMPLETED' || visit.booking?.status === 'COMPLETED';

                  return (
                    <div 
                      key={visit.id} 
                      className={`bg-white dark:bg-slate-900 border rounded-2xl mb-3 overflow-hidden transition-colors ${isExpanded ? 'border-blue-400 ring-1 ring-blue-400/20 shadow-sm dark:border-blue-500/50' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                      <div 
                        className="p-3.5 md:p-5 flex items-center gap-3 md:gap-4 select-none cursor-pointer"
                        onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                      >
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${isCancelled ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                          <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] md:text-base md:mb-1 font-semibold text-slate-900 dark:text-white mb-0.5 truncate">
                            {visit.booking?.service?.name || tEmr('history.generalVisit')}
                          </div>
                          <div className="text-[11px] md:text-sm text-slate-500 truncate">
                            {formatDateTime(visit.createdAt)} · BS. {visit.booking?.doctor?.fullName || '—'}
                          </div>
                        </div>
                        
                        {isCancelled ? (
                          <div className="rounded-full px-2.5 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold shrink-0 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                            Đã huỷ
                          </div>
                        ) : isCompleted ? (
                          <div className="rounded-full px-2.5 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Hoàn tất
                          </div>
                        ) : (
                          <div className="rounded-full px-2.5 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            Đang xử lý
                          </div>
                        )}
                        
                        <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-transform text-slate-400 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                      </div>

                      {isExpanded && renderVisitTimeline(visit)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
