import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DoctorPatientSummary } from '@/types';
import { PatientHistoryResponse, VisitHistoryItem, medicalRecordsApi } from '@/lib/api/medical-records';
import { Loader2, AlertCircle, Phone, CreditCard, ChevronDown, UserCircle2, CalendarDays, ClipboardList, TestTube2, Stethoscope, Pill, XCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface DoctorPatientDrawerProps {
  patient: DoctorPatientSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorPatientDrawer({ patient, open, onOpenChange }: DoctorPatientDrawerProps) {
  const t = useTranslations('doctorPatients');
  const tEmr = useTranslations('emr');
  const params = useParams();
  const locale = params.locale === 'vi' ? vi : enUS;

  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<PatientHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !patient?.id) return;
    setExpandedVisitId(null);
    setHistoryData(null);
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await medicalRecordsApi.getPatientHistory(patient.id);
        setHistoryData(data);
        // Auto expand latest visit
        if (data.visits && data.visits.length > 0) {
          setExpandedVisitId(data.visits[0].id);
        }
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          tEmr('history.timeline.loadError');
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [patient?.id, open, tEmr]);

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

  const toggleVisit = (id: string) => {
    setExpandedVisitId(prev => prev === id ? null : id);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl overflow-hidden flex flex-col p-0 max-h-[90vh] w-full border-slate-200/60 dark:border-slate-800 shadow-2xl rounded-2xl">
        <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50">
          <div>
            <DialogTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              {tEmr('history.timeline.modalTitle')}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1">
              {tEmr('history.timeline.modalDesc')}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-[#0c101a]">
          {loading ? (
            <div className="flex items-center justify-center p-12 h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 border-y border-red-100 dark:border-red-900/30 m-4 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          ) : historyData ? (
            <div className="flex flex-col">
              {/* COMPACT PATIENT HEADER */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 px-6 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-inner flex items-center justify-center font-bold text-xl shrink-0 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                    {historyData.patientProfile.fullName.substring(0, 1)}
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                      {historyData.patientProfile.fullName}
                    </h2>
                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                        {historyData.patientProfile.patientCode || 'N/A'}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {historyData.patientProfile.gender === 'MALE' ? t('table.male') : historyData.patientProfile.gender === 'FEMALE' ? t('table.female') : t('table.other')}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(historyData.patientProfile.dateOfBirth)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-white/40 dark:border-slate-700/50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">{t('drawer.contact')}</div>
                    <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Phone className="h-3 w-3" />
                      {historyData.patientProfile.phone || '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">{tEmr('history.timeline.bloodType')}</div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {historyData.patientProfile.bloodType || '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">{tEmr('history.timeline.nationalId')}</div>
                    <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <CreditCard className="h-3 w-3" />
                      --
                    </div>
                  </div>

                  {historyData.patientProfile.allergies && (
                    <div className="col-span-2 sm:col-span-1">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-500 border-0 flex items-center gap-1 font-normal text-[10px] h-6 px-2">
                        <AlertCircle className="h-3 w-3" />
                        {tEmr('history.timeline.allergyPrefix')}{historyData.patientProfile.allergies}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* VISIT LIST ACCORDION */}
              <div className="p-4 px-6">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {tEmr('history.timeline.historyListTitle')}
                  </h3>
                  <Badge variant="secondary" className="text-xs font-normal bg-slate-200 flex ml-2 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {historyData.visits?.length || 0} {tEmr('history.timeline.visitCountPostFix')}
                  </Badge>
                </div>

                {!historyData.visits || historyData.visits.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {t('drawer.noHistory')}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {historyData.visits.map((visit) => {
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
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

