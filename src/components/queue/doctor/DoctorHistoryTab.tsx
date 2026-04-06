'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { PatientHistoryResponse, VisitHistoryItem } from '@/lib/api/clinical/medical-records';
import { Loader2, ChevronDown, UserCircle2, CalendarDays, ClipboardList, TestTube2, Stethoscope, Pill, XCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface DoctorHistoryTabProps {
  history: PatientHistoryResponse | null;
  isLoading: boolean;
  onVisitClick?: (visit: VisitHistoryItem) => void;
}

export function DoctorHistoryTab({ history, isLoading, onVisitClick }: DoctorHistoryTabProps) {
  const t = useTranslations('doctorPatients');
  const tEmr = useTranslations('emr');
  const params = useParams();
  const locale = params.locale === 'vi' ? vi : enUS;

  console.log('history: ', history);

  const [userToggledVisitId, setUserToggledVisitId] = useState<string | null | undefined>(undefined);

  const expandedVisitId = userToggledVisitId !== undefined 
    ? userToggledVisitId 
    : (history?.visits?.[0]?.id || null);

  const toggleVisit = (id: string) => {
    setUserToggledVisitId(expandedVisitId === id ? null : id);
    if (onVisitClick) {
      const visit = history?.visits.find(v => v.id === id);
      if (visit) onVisitClick(visit);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale });
  };

  const getTimeOnly = (dateString: string | undefined) => {
    if (!dateString) return '--:--';
    return format(new Date(dateString), 'HH:mm', { locale });
  };

  // Timeline Step Renderer
  const renderVisitTimeline = (visit: VisitHistoryItem) => {
    const bookingDate = visit.booking?.bookingDate || visit.createdAt;

    // Fallback Mock Time for Steps if not available
    const checkInTime = new Date(new Date(bookingDate).getTime() + 15 * 60000).toISOString();
    const symptomsTime = visit.createdAt;
    const isCancelled = visit.booking?.status === 'CANCELLED';

    // Helpers cho timeline
    const StepIndicator = ({ done, current, isRed }: { done: boolean, current?: boolean, isRed?: boolean }) => (
      <div className={`absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 bg-white flex items-center justify-center z-10
        ${isRed ? 'border-red-500 bg-red-100' : done ? 'border-primary bg-primary' : current ? 'border-amber-500 bg-amber-100' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-900'}
      `}>
        {done && !isRed && <div className="w-1 h-1 rounded-full bg-white" />}
      </div>
    );

    return (
      <div className="pt-2 pb-4 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-700 space-y-6 mt-4">

          {/* Step 1: Booking */}
          <div className="relative">
            <StepIndicator done={true} />
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-slate-400" />
                {tEmr('history.timeline.booking')}
              </div>
              <div className="text-[10px] text-slate-500">{formatDateTime(bookingDate)}</div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-normal hover:bg-blue-100">
                {tEmr('history.timeline.bookingOffline')}
              </Badge>
            </div>
          </div>
          {/* If booking status is CANCELLED, render stop at here */}
          {isCancelled ? (
            <div className="relative">
              <StepIndicator done={true} isRed={true} />
              <div className="font-medium text-xs text-red-600 flex items-center gap-1.5">
                <XCircle className="h-3 w-3" />
                {tEmr('history.timeline.transactionEnded')}
              </div>
            </div>
          ) : (
            <>
              {/* Step 2: Check-in */}
              <div className="relative">
                <StepIndicator done={true} />
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <UserCircle2 className="h-3 w-3 text-slate-400" />
                    {tEmr('history.timeline.checkIn')}
                  </div>
                  <div className="text-[10px] text-slate-500">{formatDateTime(checkInTime)}</div>
                </div>
                <div className="text-[11px] text-slate-500">{tEmr('history.timeline.checkInDesc')}</div>
              </div>

              {/* Step 3: Symptoms */}
              <div className="relative">
                <StepIndicator done={!!visit.chiefComplaint} current={!visit.chiefComplaint} />
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ClipboardList className="h-3 w-3 text-slate-400" />
                    {tEmr('history.timeline.symptoms')}
                  </div>
                  <div className="text-[10px] text-slate-500">{formatDateTime(symptomsTime)}</div>
                </div>
                {(visit.chiefComplaint || visit.bloodPressure) && (
                  <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-2.5 shadow-sm space-y-2">
                    {visit.chiefComplaint && (
                      <div>
                        <div className="text-[10px] font-medium text-slate-500 mb-0.5">{tEmr('history.timeline.reasonForVisit')}</div>
                        <div className="text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed">
                          {visit.chiefComplaint}
                        </div>
                      </div>
                    )}
                    {(visit.heartRate || visit.bloodPressure || visit.temperature || visit.spO2) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                        {visit.heartRate && (
                          <div className="text-[10px] text-slate-600 dark:text-slate-400">
                            HR: <span className="font-medium text-slate-900 dark:text-slate-100">{visit.heartRate} bpm</span>
                          </div>
                        )}
                        {visit.bloodPressure && (
                          <div className="text-[10px] text-slate-600 dark:text-slate-400">
                            BP: <span className="font-medium text-slate-900 dark:text-slate-100">{visit.bloodPressure}</span>
                          </div>
                        )}
                        {visit.temperature && (
                          <div className="text-[10px] text-slate-600 dark:text-slate-400">
                            Temp: <span className="font-medium text-slate-900 dark:text-slate-100">{visit.temperature}°C</span>
                          </div>
                        )}
                        {visit.spO2 && (
                          <div className="text-[10px] text-slate-600 dark:text-slate-400">
                            SpO2: <span className="font-medium text-slate-900 dark:text-slate-100">{visit.spO2}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4 & 5: Services & Results */}
              {visit.visitServiceOrders && visit.visitServiceOrders.length > 0 && (
                <div className="relative">
                  <StepIndicator done={visit.visitServiceOrders.every(o => o.status === 'COMPLETED')} />
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <TestTube2 className="h-3 w-3 text-slate-400" />
                      {tEmr('history.timeline.laboratory')}
                    </div>
                  </div>
                  <div className="mt-1 space-y-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-2.5 shadow-sm">
                    {visit.visitServiceOrders.map(order => (
                      <div key={order.id} className="flex justify-between items-center group">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                            {order.service?.name}
                          </span>
                          {order.status === 'COMPLETED' ? (
                            <Badge variant="outline" className="text-[8px] h-4 leading-3 border-emerald-200 text-emerald-600 dark:border-emerald-900 dark:text-emerald-400 px-1 py-0">{tEmr('history.timeline.serviceDone')}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[8px] h-4 leading-3 border-amber-200 text-amber-600 dark:border-amber-900 dark:text-amber-400 px-1 py-0">{tEmr('history.timeline.servicePending')}</Badge>
                          )}
                        </div>
                        {order.status === 'COMPLETED' && order.resultText && (
                          <div className="text-[11px] text-slate-500 ml-3 truncate max-w-[40%] flex items-center gap-1.5">
                            {order.resultText}
                            {(order.resultFileUrl) && (
                              <ImageIcon className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Diagnosis */}
              <div className="relative">
                <StepIndicator done={!!visit.diagnosisName} />
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Stethoscope className="h-3 w-3 text-slate-400" />
                    {tEmr('history.timeline.diagnosis')}
                  </div>
                </div>
                {visit.diagnosisName ? (
                  <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-2.5 shadow-sm space-y-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] text-slate-500">ICD-10</span>
                      {visit.diagnosisCode && (
                        <Badge variant="secondary" className="text-[9px] h-4 leading-4 px-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-sm">
                          {visit.diagnosisCode}
                        </Badge>
                      )}
                      <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        {visit.diagnosisName}
                      </span>
                    </div>
                    {visit.treatmentPlan && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 mt-1.5 pt-1.5">
                        {visit.treatmentPlan}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    {tEmr('history.timeline.noDiagnosis')}
                  </div>
                )}
              </div>

              {/* Step 7: Prescription */}
              <div className="relative">
                <StepIndicator done={!!(visit.prescription?.items && visit.prescription.items.length > 0)} />
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Pill className="h-3 w-3 text-slate-400" />
                    {tEmr('history.timeline.prescription')}
                  </div>
                </div>
                {visit.prescription?.items && visit.prescription.items.length > 0 ? (
                  <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-2.5 shadow-sm space-y-1.5">
                    {visit.prescription.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800/50 last:border-0 pb-1.5 last:pb-0 mb-1.5 last:mb-0">
                        <div>
                          <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            {item.medicineName}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {item.dosage} · {item.frequency} {item.durationDays ? `· ${item.durationDays} ${tEmr('history.detail.rxDays')}` : ''}
                          </div>
                        </div>
                        <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    {tEmr('history.timeline.noPrescription')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500 bg-white border border-slate-100 shadow-sm rounded-2xl">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="text-sm font-medium">{tEmr('history.loading')}</span>
      </div>
    );
  }

  if (!history || history.visits.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100/80 mb-2">
          <FileText size={32} className="text-slate-400" />
        </div>
        <span className="text-sm font-medium">{tEmr('history.empty')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-indigo-500" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {tEmr('history.timeline.historyListTitle')}
        </h3>
        <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {history.visits.length} {tEmr('history.timeline.visitCountPostFix')}
        </Badge>
      </div>

      <div className="space-y-4">
        {history.visits.map((visit) => {
          const isExpanded = expandedVisitId === visit.id;
          const isCancelled = visit.booking?.status === 'CANCELLED';
          return (
            <div
              key={visit.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm group
                ${isExpanded ? 'border-primary/40 shadow-md ring-2 ring-primary/10 -translate-y-0.5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5'}
              `}
            >
              <div
                className="p-3.5 px-4 cursor-pointer flex items-center justify-between select-none"
                onClick={() => toggleVisit(visit.id)}
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    ${isCancelled ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}
                  `}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {formatDate(visit.booking?.bookingDate || visit.createdAt)}
                      <span className="text-slate-400 text-xs font-normal">·</span>
                      <span className="text-slate-500 text-xs font-medium">{getTimeOnly(visit.booking?.bookingDate || visit.createdAt)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {visit.booking?.service?.name || '--'}
                      </span>
                      <span>·</span>
                      {t('drawer.dr')} {visit.booking?.doctor?.fullName || '--'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isCancelled ? (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-0 font-medium">
                      {tEmr('history.timeline.cancelled')}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 font-medium">
                      {tEmr('history.timeline.completed')}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expansion Panel content */}
              {isExpanded && renderVisitTimeline(visit)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
