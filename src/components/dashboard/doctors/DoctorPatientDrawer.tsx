import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DoctorPatientSummary } from '@/types';
import { PatientHistoryResponse, VisitHistoryItem, medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import {
  Loader2, AlertCircle, Phone, ChevronDown,
  UserCircle2, CalendarDays, ClipboardList, TestTube2,
  Stethoscope, Pill, XCircle, FileText, Image as ImageIcon,
  Heart, Activity, Thermometer, Droplets,
  User, History, Fingerprint
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DoctorPatientDrawerProps {
  patient: DoctorPatientSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorPatientDrawer({ patient, open, onOpenChange }: DoctorPatientDrawerProps) {
  const t = useTranslations('doctorPatients');
  const tEmr = useTranslations('emr');
  const currentLocale = useLocale();
  const locale = currentLocale === 'vi' ? vi : enUS;

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
      <div className={`absolute -left-[32.5px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-all duration-300
        ${isRed ? 'border-red-500 bg-red-100 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : done ? 'border-brand-500 bg-brand-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]' : current ? 'border-amber-500 bg-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-900'}
      `}>
        {done && !isRed && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in duration-300" />}
      </div>
    );

    return (
      <div className="pt-2 pb-6 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
        <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-8 mt-6">

          {/* Step 1: Booking */}
          <div className="relative">
            <StepIndicator done={true} />
            <div className="flex justify-between items-start mb-1.5">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                {tEmr('history.timeline.booking')}
              </div>
              <div className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-tight">
                {formatDateTime(bookingDate)}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 font-bold hover:bg-brand-100 border-none px-2.5">
                {tEmr('history.timeline.bookingOffline')}
              </Badge>
            </div>
          </div>

          {/* If booking status is CANCELLED, render stop at here */}
          {isCancelled ? (
            <div className="relative">
              <StepIndicator done={true} isRed={true} />
              <div className="font-bold text-xs text-red-600 flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5" />
                {tEmr('history.timeline.transactionEnded')}
              </div>
            </div>
          ) : (
            <>
              {/* Step 2: Check-in */}
              <div className="relative">
                <StepIndicator done={true} />
                <div className="flex justify-between items-start mb-1.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <UserCircle2 className="h-3.5 w-3.5 text-slate-400" />
                    {tEmr('history.timeline.checkIn')}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-tight">
                    {formatDateTime(checkInTime)}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{tEmr('history.timeline.checkInDesc')}</div>
              </div>

              {/* Step 3: Symptoms */}
              <div className="relative">
                <StepIndicator done={!!visit.chiefComplaint} current={!visit.chiefComplaint} />
                <div className="flex justify-between items-start mb-1.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
                    {tEmr('history.timeline.symptoms')}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-tight">
                    {formatDateTime(symptomsTime)}
                  </div>
                </div>
                {(visit.chiefComplaint || visit.bloodPressure) && (
                  <div className="mt-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 rounded-xl p-3 shadow-sm space-y-3">
                    {visit.chiefComplaint && (
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 opacity-80">{tEmr('history.timeline.reasonForVisit')}</div>
                        <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {visit.chiefComplaint}
                        </div>
                      </div>
                    )}
                    {(visit.heartRate || visit.bloodPressure || visit.temperature || visit.spO2) && (
                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                        {visit.heartRate && (
                          <div className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3 text-red-500" />
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                              HR: <span className="text-slate-900 dark:text-slate-100">{visit.heartRate} bpm</span>
                            </div>
                          </div>
                        )}
                        {visit.bloodPressure && (
                          <div className="flex items-center gap-1.5">
                            <Heart className="h-3 w-3 text-rose-500" />
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                              BP: <span className="text-slate-900 dark:text-slate-100">{visit.bloodPressure}</span>
                            </div>
                          </div>
                        )}
                        {visit.temperature && (
                          <div className="flex items-center gap-1.5">
                            <Thermometer className="h-3 w-3 text-orange-500" />
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                              Temp: <span className="text-slate-900 dark:text-slate-100">{visit.temperature}°C</span>
                            </div>
                          </div>
                        )}
                        {visit.spO2 && (
                          <div className="flex items-center gap-1.5">
                            <Droplets className="h-3 w-3 text-blue-500" />
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                              SpO2: <span className="text-slate-900 dark:text-slate-100">{visit.spO2}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4 & 5: Services & Results (Both Specialists & Labs) */}
              {((visit.visitServiceOrders && visit.visitServiceOrders.length > 0) || (visit.labOrders && visit.labOrders.length > 0)) && (
                <div className="relative">
                  <StepIndicator 
                    done={
                      [...(visit.visitServiceOrders || []), ...(visit.labOrders || [])]
                        .every(o => o.status === 'COMPLETED' || o.status === 'CANCELLED')
                    } 
                  />
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <TestTube2 className="h-3.5 w-3.5 text-slate-400" />
                      {tEmr('history.timeline.laboratory')}
                    </div>
                  </div>
                  <div className="mt-2 space-y-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 rounded-xl p-3 shadow-sm">
                    {/* Render Specialist Service Orders */}
                    {visit.visitServiceOrders?.map(order => (
                      <div key={order.id} className="flex justify-between items-center group bg-slate-50/50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/20">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {order.service?.name}
                          </span>
                          {order.status === 'COMPLETED' ? (
                            <Badge variant="outline" className="text-[9px] h-4 leading-3 border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400 px-1.5 py-0 font-bold">{tEmr('history.timeline.serviceDone')}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] h-4 leading-3 border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400 px-1.5 py-0 font-bold">{tEmr('history.timeline.servicePending')}</Badge>
                          )}
                        </div>
                        {order.status === 'COMPLETED' && (order.resultText || order.resultFileUrl) && (
                          <div className="text-[11px] font-medium text-slate-500 ml-3 truncate max-w-[40%] flex items-center gap-1.5">
                            {order.resultText && <span className="italic text-brand-600 dark:text-brand-400">{order.resultText}</span>}
                            {order.resultFileUrl && (
                              <ImageIcon className="h-3 w-3 text-brand-500" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Render Lab/Imaging Orders */}
                    {visit.labOrders?.map(order => (
                      <div key={order.id} className="flex justify-between items-center group bg-slate-50/50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/20">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {order.service?.name || order.testName}
                          </span>
                          {order.status === 'COMPLETED' ? (
                            <Badge variant="outline" className="text-[9px] h-4 leading-3 border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400 px-1.5 py-0 font-bold">{tEmr('history.timeline.serviceDone')}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] h-4 leading-3 border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400 px-1.5 py-0 font-bold">{tEmr('history.timeline.servicePending')}</Badge>
                          )}
                        </div>
                        {order.status === 'COMPLETED' && (order.result?.resultText || order.result?.resultFileUrl) && (
                          <div className="text-[11px] font-medium text-slate-500 ml-3 truncate max-w-[40%] flex items-center gap-1.5">
                            {order.result?.resultText && <span className="italic text-brand-600 dark:text-brand-400">{order.result.resultText}</span>}
                            {order.result?.resultFileUrl && (
                              <ImageIcon className="h-3 w-3 text-brand-500" />
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
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                    {tEmr('history.timeline.diagnosis')}
                  </div>
                </div>
                {visit.diagnosisName ? (
                  <div className="mt-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 rounded-xl p-3 shadow-sm space-y-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">ICD-10</span>
                      {visit.diagnosisCode && (
                        <Badge variant="secondary" className="text-[10px] h-5 leading-5 px-2 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded-md font-bold border-none">
                          {visit.diagnosisCode}
                        </Badge>
                      )}
                      <span className="text-[13px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                        {visit.diagnosisName}
                      </span>
                    </div>
                    {visit.treatmentPlan && (
                      <div className="text-[12px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 mt-2 pt-2 italic">
                        <span className="text-[10px] not-italic font-black text-slate-400 uppercase mr-1.5 opacity-60">Plan:</span>
                        {visit.treatmentPlan}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic font-medium">
                    {tEmr('history.timeline.noDiagnosis')}
                  </div>
                )}
              </div>

              {/* Step 7: Prescription */}
              <div className="relative">
                <StepIndicator done={!!(visit.prescription?.items && visit.prescription.items.length > 0)} />
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Pill className="h-3.5 w-3.5 text-slate-400" />
                    {tEmr('history.timeline.prescription')}
                  </div>
                </div>
                {visit.prescription?.items && visit.prescription.items.length > 0 ? (
                  <div className="mt-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 rounded-xl p-3 shadow-sm space-y-2">
                    {visit.prescription.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700/30 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0 group/med">
                        <div className="flex gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 border border-slate-100 dark:border-slate-800">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-[12px] font-bold text-slate-900 dark:text-slate-100 group-hover/med:text-brand-600 dark:group-hover/med:text-brand-400 transition-colors">
                              {item.medicineName}
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span className="text-slate-400 font-normal">Dose:</span> {item.dosage} 
                              <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />
                              <span className="text-slate-400 font-normal">Freq:</span> {item.frequency}
                              {item.durationDays && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />
                                  <span className="text-brand-600/70 dark:text-brand-400/70">{item.durationDays} days</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic font-medium">
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 border-none w-full sm:max-w-[500px] md:max-w-[650px] bg-white dark:bg-[#0c101a] shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)] flex flex-col border-l border-slate-200/60 dark:border-slate-800"
      >
        <SheetHeader className="relative overflow-hidden pt-12 pb-6 px-8 border-b border-slate-100 dark:border-slate-800 shrink-0 block text-left">
          <SheetDescription className="sr-only">
            {t('drawer.desc')}
          </SheetDescription>
          {/* Background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-[28px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-2xl flex items-center justify-center font-black text-4xl shrink-0 ring-8 ring-white dark:ring-[#0c101a] relative">
                {historyData?.patientProfile.fullName.substring(0, 1) || patient?.fullName.substring(0, 1)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-4 border-white dark:border-[#0c101a] flex items-center justify-center">
                <Fingerprint className="h-4 w-4 text-brand-500" />
              </div>
            </div>

            <div className="flex-1 pt-1 space-y-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <SheetTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                    {historyData?.patientProfile.fullName || patient?.fullName}
                  </SheetTitle>
                  <Badge variant="outline" className="bg-brand-50/50 text-brand-600 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800/50 font-black text-[11px] px-2.5 py-0.5 rounded-lg uppercase tracking-wider h-6">
                    {historyData?.patientProfile.patientCode || patient?.patientCode || 'N/A'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest opacity-80">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{historyData?.patientProfile.gender === 'MALE' ? t('table.male') : historyData?.patientProfile.gender === 'FEMALE' ? t('table.female') : t('table.other')}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(historyData?.patientProfile.dateOfBirth)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50/80 dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 group/info hover:border-brand-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 group-hover/info:scale-110 transition-transform">
                    <Phone className="h-4 w-4 text-brand-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 leading-none mb-1">{t('drawer.contact')}</p>
                    <p className="text-[13px] font-black text-slate-900 dark:text-slate-100">{historyData?.patientProfile.phone || '--'}</p>
                  </div>
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 group/info hover:border-brand-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 group-hover/info:scale-110 transition-transform">
                    <Droplets className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 leading-none mb-1">{tEmr('history.timeline.bloodType')}</p>
                    <p className="text-[13px] font-black text-slate-900 dark:text-slate-100">{historyData?.patientProfile.bloodType || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {historyData?.patientProfile.allergies && (
            <div className="mt-6 px-8">
              <div className="bg-red-50/80 dark:bg-red-900/10 p-3 rounded-2xl border border-red-100/50 dark:border-red-900/20 flex items-center gap-3 animate-pulse-highlight">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-red-900/20 shadow-sm flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block leading-none mb-1">{tEmr('history.timeline.allergyPrefix')}</span>
                  <span className="text-[12px] font-bold text-red-700 dark:text-red-400">{historyData.patientProfile.allergies}</span>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-brand-100 dark:border-brand-900/20" />
                    <Loader2 className="h-12 w-12 animate-spin text-brand-500 absolute inset-0" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">{tEmr('visit.loading')}</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl animate-in zoom-in duration-500">
                  <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
                </div>
              ) : historyData ? (
                <>
                  {/* TIMELINE SECTION */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-500 shadow-sm border border-brand-100/50 dark:border-brand-900/20">
                          <History className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">
                            {tEmr('history.timeline.historyListTitle')}
                          </h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                            {historyData.visits?.length || 0} {tEmr('history.timeline.visitCountPostFix')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!historyData.visits || historyData.visits.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800/50 space-y-4">
                        <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
                        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{t('drawer.noHistory')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {historyData.visits.map((visit) => {
                          const isExpanded = expandedVisitId === visit.id;
                          const isCancelled = visit.booking?.status === 'CANCELLED';
                          return (
                            <Card
                              key={visit.id}
                              className={`
                                rounded-[24px] border transition-all duration-500 overflow-hidden group relative flex flex-col gap-0 py-0 shadow-none
                                ${isExpanded ? 'bg-white dark:bg-slate-900 border-brand-500/30 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.15)] ring-1 ring-brand-500/20 scale-[1.01]' : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1'}
                              `}
                            >
                              <div
                                className="p-5 cursor-pointer flex items-center justify-between select-none relative z-10"
                                onClick={() => toggleVisit(visit.id)}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-transform duration-500 group-hover:scale-110
                                    ${isCancelled ? 'bg-red-50 text-red-500 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-brand-50 text-brand-500 border-brand-100 dark:bg-brand-900/20 dark:border-brand-800/30'}
                                  `}>
                                    <FileText className="h-6 w-6" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="text-[14px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                        {formatDate(visit.booking?.bookingDate || visit.createdAt)}
                                      </div>
                                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                      <span className="text-brand-600 dark:text-brand-400 text-[11px] font-black uppercase tracking-widest">{getTimeOnly(visit.booking?.bookingDate || visit.createdAt)}</span>
                                    </div>
                                    <div className="text-[12px] text-slate-500 font-bold flex items-center gap-2 opacity-80 truncate">
                                      <span className="text-slate-800 dark:text-slate-200">{visit.booking?.service?.name || '--'}</span>
                                      <span className="text-slate-300">/</span>
                                      <span className="truncate">{visit.booking?.doctor?.fullName || '--'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  {isCancelled ? (
                                    <Badge className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-none font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                      {tEmr('history.timeline.cancelled')}
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-none font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                      {tEmr('history.timeline.completed')}
                                    </Badge>
                                  )}
                                  <div className={`w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-brand-500 text-white rotate-180' : 'text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-600'}`}>
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>

                              {/* Expansion Panel content */}
                              <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                                <div className="overflow-hidden">
                                  {renderVisitTimeline(visit)}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer note */}
                  <div className="pt-10 border-t border-slate-100 dark:border-slate-800 text-center space-y-3 pb-8">
                     <Fingerprint className="h-8 w-8 text-slate-200 dark:text-slate-800 mx-auto" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{tEmr('history.timeline.transactionEnded')}</p>
                  </div>
                </>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
