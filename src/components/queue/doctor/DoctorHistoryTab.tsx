'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import type { PatientHistoryResponse, VisitHistoryItem } from '@/lib/api/clinical/medical-records';
import { Loader2, ChevronDown, UserCircle2, CalendarDays, ClipboardList, TestTube2, Stethoscope, Pill, XCircle, FileText } from 'lucide-react';
import type { Locale } from 'date-fns';

interface DoctorHistoryTabProps {
  history: PatientHistoryResponse | null;
  isLoading: boolean;
  onVisitClick?: (visit: VisitHistoryItem) => void;
}

export function DoctorHistoryTab({ history, isLoading, onVisitClick }: DoctorHistoryTabProps) {
  const tEmr = useTranslations('emr');
  const currentLocale = useLocale();
  const locale = currentLocale === 'vi' ? vi : enUS;

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

  if (isLoading) return <LoadingState tEmr={tEmr} />;
  if (!history || history.visits.length === 0) return <EmptyHistory tEmr={tEmr} />;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
      <HistoryHeader count={history.visits.length} tEmr={tEmr} />
      <div className="space-y-4">
        {history.visits.map((visit) => (
          <VisitCard 
            key={visit.id} 
            visit={visit} 
            isExpanded={expandedVisitId === visit.id} 
            onToggle={() => toggleVisit(visit.id)} 
            locale={locale} 
            tEmr={tEmr}
          />
        ))}
      </div>
    </div>
  );
}

interface TranslationProp {
  tEmr: ReturnType<typeof useTranslations<'emr'>>;
}

function LoadingState({ tEmr }: TranslationProp) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500 bg-white border border-slate-100 shadow-sm rounded-2xl">
      <Loader2 size={32} className="animate-spin text-primary" />
      <span className="text-sm font-medium">{tEmr('history.loading')}</span>
    </div>
  );
}

function EmptyHistory({ tEmr }: TranslationProp) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100/80 mb-2">
        <FileText size={32} className="text-slate-400" />
      </div>
      <span className="text-sm font-medium">{tEmr('history.empty')}</span>
    </div>
  );
}

interface HistoryHeaderProps extends TranslationProp {
  count: number;
}

function HistoryHeader({ count, tEmr }: HistoryHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <ClipboardList className="h-5 w-5 text-indigo-500" />
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {tEmr('history.timeline.historyListTitle')}
      </h3>
      <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-700">
        {count} {tEmr('history.timeline.visitCountPostFix')}
      </Badge>
    </div>
  );
}

interface VisitCardProps extends TranslationProp {
  visit: VisitHistoryItem;
  isExpanded: boolean;
  onToggle: () => void;
  locale: Locale;
}

function VisitCard({ visit, isExpanded, onToggle, locale, tEmr }: VisitCardProps) {
  const isCancelled = visit.booking?.status === 'CANCELLED';
  const date = visit.booking?.bookingDate || visit.createdAt;

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white/90 group ${isExpanded ? 'border-primary/40 shadow-md ring-2 ring-primary/10' : 'border-slate-200 hover:shadow-md'}`}>
      <div className="p-3.5 px-4 cursor-pointer flex items-center justify-between select-none" onClick={onToggle}>
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCancelled ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              {format(new Date(date), 'dd/MM/yyyy', { locale })}
              <span className="text-slate-400 text-xs font-normal">·</span>
              <span className="text-slate-500 text-xs font-medium">{format(new Date(date), 'HH:mm', { locale })}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
              <span className="font-medium text-slate-700">{visit.booking?.service?.name || '--'}</span>
              <span>·</span>
              {visit.booking?.doctor?.fullName || '--'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge className={isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
            {isCancelled ? tEmr('history.timeline.cancelled') : tEmr('history.timeline.completed')}
          </Badge>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isExpanded && <VisitTimeline visit={visit} tEmr={tEmr} />}
    </div>
  );
}

interface VisitTimelineProps extends TranslationProp {
  visit: VisitHistoryItem;
}

function VisitTimeline({ visit, tEmr }: VisitTimelineProps) {
  const isCancelled = visit.booking?.status === 'CANCELLED';
  const date = visit.booking?.bookingDate || visit.createdAt;

  return (
    <div className="pt-2 pb-4 px-4 border-t border-slate-100 bg-slate-50/50">
      <div className="relative pl-4 border-l border-slate-200 space-y-6 mt-4">
        <TimelineStep icon={<CalendarDays className="h-3 w-3" />} label={tEmr('history.timeline.booking')} time={date} done />
        {isCancelled ? (
          <TimelineStep icon={<XCircle className="h-3 w-3" />} label={tEmr('history.timeline.transactionEnded')} isRed done />
        ) : (
          <>
            <TimelineStep icon={<UserCircle2 className="h-3 w-3" />} label={tEmr('history.timeline.checkIn')} time={date} desc={tEmr('history.timeline.checkInDesc')} done />
            <SymptomsStep visit={visit} tEmr={tEmr} />
            <LaboratoryStep orders={visit.visitServiceOrders} tEmr={tEmr} />
            <DiagnosisStep visit={visit} tEmr={tEmr} />
            <PrescriptionStep prescription={visit.prescription} tEmr={tEmr} />
          </>
        )}
      </div>
    </div>
  );
}

interface TimelineStepProps {
  label: string;
  time?: string | Date;
  desc?: string;
  done?: boolean;
  current?: boolean;
  isRed?: boolean;
  icon: React.ReactNode;
}

function TimelineStep({ label, time, desc, done, current, isRed, icon }: TimelineStepProps) {
  return (
    <div className="relative">
      <div className={`absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 bg-white flex items-center justify-center z-10 ${isRed ? 'border-red-500 bg-red-100' : done ? 'border-primary bg-primary' : current ? 'border-amber-500 bg-amber-100' : 'border-slate-300'}`}>
        {done && !isRed && <div className="w-1 h-1 rounded-full bg-white" />}
      </div>
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-xs text-slate-800 flex items-center gap-1.5">{icon}{label}</div>
        {time && <div className="text-[10px] text-slate-500">{format(new Date(time), 'dd/MM/yyyy HH:mm')}</div>}
      </div>
      {desc && <div className="text-[11px] text-slate-500">{desc}</div>}
    </div>
  );
}

function SymptomsStep({ visit, tEmr }: VisitTimelineProps) {
  if (!visit.chiefComplaint && !visit.bloodPressure) return null;
  return (
    <div className="relative">
      <div className="absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-primary z-10" />
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-xs text-slate-800 flex items-center gap-1.5"><ClipboardList className="h-3 w-3" />{tEmr('history.timeline.symptoms')}</div>
      </div>
      <div className="mt-1 bg-white border border-slate-100 rounded-md p-2.5 shadow-sm space-y-2">
        {visit.chiefComplaint && (
          <div>
            <div className="text-[10px] font-medium text-slate-500 mb-0.5">{tEmr('history.timeline.reasonForVisit')}</div>
            <div className="text-[11px] text-slate-800 leading-relaxed">{visit.chiefComplaint}</div>
          </div>
        )}
        <VitalSigns visit={visit} />
      </div>
    </div>
  );
}

function VitalSigns({ visit }: { visit: VisitHistoryItem }) {
  const vitals = [
    { label: 'HR', value: visit.heartRate, unit: 'bpm' },
    { label: 'BP', value: visit.bloodPressure },
    { label: 'Temp', value: visit.temperature, unit: '°C' },
    { label: 'SpO2', value: visit.spO2, unit: '%' },
  ].filter(v => v.value);

  if (vitals.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-50">
      {vitals.map(v => (
        <div key={v.label} className="text-[10px] text-slate-600">
          {v.label}: <span className="font-medium text-slate-900">{v.value}{v.unit}</span>
        </div>
      ))}
    </div>
  );
}

interface LaboratoryStepProps extends TranslationProp {
  orders?: VisitHistoryItem['visitServiceOrders'];
}

function LaboratoryStep({ orders, tEmr }: LaboratoryStepProps) {
  if (!orders || orders.length === 0) return null;
  return (
    <div className="relative">
      <div className="absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-primary z-10" />
      <div className="font-medium text-xs text-slate-800 flex items-center gap-1.5"><TestTube2 className="h-3 w-3" />{tEmr('history.timeline.laboratory')}</div>
      <div className="mt-1 space-y-1.5 bg-white border border-slate-100 rounded-md p-2.5 shadow-sm">
        {orders.map((order) => (
          <div key={order.id} className="flex justify-between items-center group text-[11px]">
            <span className="font-medium text-slate-700 truncate">{order.service?.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 ${order.status === 'COMPLETED' ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-600'}`}>
              {order.status === 'COMPLETED' ? tEmr('history.timeline.serviceDone') : tEmr('history.timeline.servicePending')}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagnosisStep({ visit, tEmr }: VisitTimelineProps) {
  return (
    <div className="relative">
      <div className={`absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 z-10 ${visit.diagnosisName ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`} />
      <div className="font-medium text-xs text-slate-800 flex items-center gap-1.5"><Stethoscope className="h-3 w-3" />{tEmr('history.timeline.diagnosis')}</div>
      {visit.diagnosisName ? (
        <div className="mt-1 bg-white border border-slate-100 rounded-md p-2.5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-500">ICD-10</span>
            {visit.diagnosisCode && <Badge variant="secondary" className="text-[9px] h-4 bg-blue-50 text-blue-700">{visit.diagnosisCode}</Badge>}
            <span className="text-[11px] font-medium text-slate-800">{visit.diagnosisName}</span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic">{tEmr('history.timeline.noDiagnosis')}</div>
      )}
    </div>
  );
}

interface PrescriptionStepProps extends TranslationProp {
  prescription?: VisitHistoryItem['prescription'];
}

function PrescriptionStep({ prescription, tEmr }: PrescriptionStepProps) {
  const items = prescription?.items || [];
  return (
    <div className="relative">
      <div className={`absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 z-10 ${items.length > 0 ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`} />
      <div className="font-medium text-xs text-slate-800 flex items-center gap-1.5"><Pill className="h-3 w-3" />{tEmr('history.timeline.prescription')}</div>
      {items.length > 0 ? (
        <div className="mt-1 bg-white border border-slate-100 rounded-md p-2.5 shadow-sm space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-slate-50 last:border-0 pb-1.5 last:pb-0">
              <div className="text-[11px]">
                <div className="font-medium text-slate-800">{item.medicineName}</div>
                <div className="text-[10px] text-slate-500">{item.dosage} · {item.frequency}</div>
              </div>
              <div className="text-[11px] font-medium text-emerald-600">{item.quantity} {item.unit}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic">{tEmr('history.timeline.noPrescription')}</div>
      )}
    </div>
  );
}
