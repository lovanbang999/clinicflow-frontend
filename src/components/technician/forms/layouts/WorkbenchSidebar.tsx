import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  UserIcon,
  ActivityIcon,
  StethoscopeIcon,
  WarningCircleIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  CalendarIcon,
} from '@phosphor-icons/react';
import { LabOrder } from '@/lib/api/clinical/lab-orders';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WorkbenchSidebarProps {
  order: LabOrder;
  allOrders: LabOrder[];
  activeId: string;
  onSelectOrder: (id: string) => void;
}

type RecentResultItem = NonNullable<LabOrder['recentResults']>[number];

export function WorkbenchSidebar({
  order,
  allOrders,
  activeId,
  onSelectOrder,
}: WorkbenchSidebarProps) {
  const t = useTranslations('technicianWorklist');
  const [selectedHistory, setSelectedHistory] = useState<RecentResultItem | null>(null);

  const p = order.patientProfile;
  const b = order.booking;
  const vitals = order.medicalRecord;

  const calcAge = (dob?: string) =>
    dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 'N/A';

  return (
    <div className="space-y-6">
      {/* Patient Card */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <UserIcon size={14} weight="bold" />
            {t('workspace.patientInfo')}
          </h3>
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="flex flex-col gap-1.5">
            <div className="font-black text-slate-800 text-base leading-tight">
              {p?.fullName ?? 'N/A'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                {calcAge(p?.dateOfBirth)} {t('workspace.sidebar.ageUnit')} • {p?.gender === 'MALE' ? t('workspace.gender.male') : p?.gender === 'FEMALE' ? t('workspace.gender.female') : 'N/A'}
              </span>
              <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded">
                {p?.patientCode ?? 'N/A'}
              </span>
            </div>
            {order.booking?.bookingCode && (
              <div className="text-xs text-slate-400 font-medium">
                {t('result.form.patientCodeLabel')}: {order.booking.bookingCode}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-500">
              <WarningCircleIcon size={14} weight="fill" />
              <span className="text-xs font-black uppercase tracking-tight">
                {t('workspace.sidebar.allergy')}: {vitals?.allergies || t('workspace.sidebar.noAllergy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <StethoscopeIcon size={14} weight="bold" />
              <span className="text-xs font-bold">{t('doctorPrefix')} {b?.doctor?.fullName ?? 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Card */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ActivityIcon size={14} weight="bold" />
            {t('workspace.vitals.title')}
          </h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('workspace.vitals.bp')}</span>
            <span className="text-sm font-black text-slate-700">{vitals?.bloodPressure || '--'} <span className="text-[10px] text-slate-400 font-bold">mmHg</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('workspace.vitals.hr')}</span>
            <span className="text-sm font-black text-slate-700">{vitals?.heartRate || '--'} <span className="text-[10px] text-slate-400 font-bold">bpm</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('workspace.vitals.spo2')}</span>
            <span className="text-sm font-black text-emerald-600">{vitals?.spO2 || '--'} <span className="text-[10px] text-slate-400 font-bold">%</span></span>
          </div>
          {vitals?.temperature && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{t('workspace.vitals.temp')}</span>
              <span className="text-sm font-black text-slate-700">{vitals.temperature} <span className="text-[10px] text-slate-400 font-bold">°C</span></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions & Diagnosis Card */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileTextIcon size={14} weight="bold" />
            {t('workspace.sidebar.diagAndOrder')}
          </h3>
        </div>
        <CardContent className="p-4 space-y-3 text-xs">
          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t('workspace.sidebar.complaint')}</div>
            <div className="text-slate-700 font-medium">{vitals?.chiefComplaint || '--'}</div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t('workspace.sidebar.prelimDiag')}</div>
            <div className="text-slate-700 font-medium">{vitals?.diagnosisName || vitals?.clinicalFindings || '--'}</div>
          </div>
          <div className="pt-2 border-t border-slate-50">
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">{t('workspace.sidebar.docNotes')}</div>
            <div className="text-slate-700 font-medium">{order.testDescription || vitals?.doctorNotes || '--'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Result History Card */}
      {order.recentResults && order.recentResults.length > 0 && (
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ClockIcon size={14} weight="bold" />
              {t('workspace.sidebar.resultHistory', { count: order.recentResults.length })}
            </h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-[250px] overflow-y-auto">
            {order.recentResults.map((hist) => (
              <button
                key={hist.id}
                onClick={() => setSelectedHistory(hist)}
                className="w-full text-left p-4 hover:bg-slate-50 transition-all flex flex-col gap-1 border-none bg-transparent cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-700 truncate">{hist.testName}</div>
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <CalendarIcon size={12} />
                  {hist.result?.resultDate ? format(new Date(hist.result.resultDate), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </div>
                {hist.result?.resultText && (
                  <div className="text-[11px] text-slate-500 truncate mt-1 bg-slate-50 p-1 rounded font-medium">
                    {hist.result.resultText}
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Orders List - Condensed Card */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ActivityIcon size={14} weight="bold" />
            {t('workspace.sidebar.otherOrders')} ({allOrders.length})
          </h3>
        </div>
        <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-50">
          {allOrders.map((itm) => {
            const isActive = itm.id === activeId;
            const isDone = itm.status === 'COMPLETED';
            
            return (
              <button
                key={itm.id}
                onClick={() => onSelectOrder(itm.id)}
                className={cn(
                  "w-full text-left p-4 transition-all flex items-center gap-3 group border-none bg-transparent cursor-pointer",
                  isActive ? "bg-blue-50/80" : "hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
                  isDone ? "bg-emerald-400" : "bg-orange-400",
                  isActive && "scale-125 ring-4 ring-blue-100"
                )} />
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-bold text-[11px] uppercase tracking-tight truncate",
                    isActive ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
                  )}>
                    {itm.testName}
                  </div>
                </div>
                {!isActive && (
                   <span className={cn(
                    "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                    isDone ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {isDone ? t('workspace.status.completed').split(' ')[0] : '...'}
                  </span>
                )}
                {isDone && <CheckIcon size={12} weight="bold" className="text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* History Details Dialog */}
      <Dialog open={!!selectedHistory} onOpenChange={(open) => !open && setSelectedHistory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('workspace.sidebar.oldResultDetail')}</DialogTitle>
            <DialogDescription>
              {t('workspace.sidebar.oldResultDesc')}
            </DialogDescription>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4 mt-2 text-sm">
              <div>
                <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider">{t('workspace.sidebar.serviceLabel')}</span>
                <span className="font-black text-slate-800 text-base">{selectedHistory.testName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider">{t('workspace.sidebar.performedDate')}</span>
                  <span className="font-semibold text-slate-700">
                    {selectedHistory.result?.resultDate ? format(new Date(selectedHistory.result.resultDate), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider">{t('workspace.sidebar.technicianLabel')}</span>
                  <span className="font-semibold text-slate-700">
                    {selectedHistory.assignedTechnician?.fullName || selectedHistory.result?.recordedBy || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">{t('workspace.sidebar.conclusionOrDetail')}</span>
                <div className="bg-slate-50 p-4 rounded-xl font-medium text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedHistory.result?.resultText || t('workspace.sidebar.noResultContent')}
                </div>
              </div>
              {selectedHistory.result?.resultFileUrl && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 block text-xs uppercase tracking-wider mb-1">{t('workspace.sidebar.attachedFile')}</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedHistory.result.resultFileUrl.split(',').map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <FileTextIcon size={14} />
                        {t('workspace.sidebar.viewDocument', { num: index + 1 })}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
