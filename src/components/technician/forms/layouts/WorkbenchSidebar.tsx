import { useTranslations } from 'next-intl';
import {
  UserIcon,
  ActivityIcon,
  StethoscopeIcon,
  WarningCircleIcon,
  CheckIcon,
} from '@phosphor-icons/react';
import { LabOrder } from '@/lib/api/clinical/lab-orders';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WorkbenchSidebarProps {
  order: LabOrder;
  allOrders: LabOrder[];
  activeId: string;
  onSelectOrder: (id: string) => void;
  locale: string;
}

export function WorkbenchSidebar({
  order,
  allOrders,
  activeId,
  onSelectOrder,
}: WorkbenchSidebarProps) {
  const t = useTranslations('technicianWorklist');
  const p = order.patientProfile;
  const b = order.booking;

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
              <span className="text-xs font-black uppercase tracking-tight">{t('workspace.sidebar.allergy')}: Penicillin</span>
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
            <span className="text-sm font-black text-slate-700">120/80 <span className="text-[10px] text-slate-400 font-bold">mmHg</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('workspace.vitals.hr')}</span>
            <span className="text-sm font-black text-slate-700">72 <span className="text-[10px] text-slate-400 font-bold">bpm</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('workspace.vitals.spo2')}</span>
            <span className="text-sm font-black text-emerald-600">98 <span className="text-[10px] text-slate-400 font-bold">%</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Orders List - Condensed Card */}
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ActivityIcon size={14} weight="bold" />
            {t('workspace.sidebar.otherOrders')} ({allOrders.length})
          </h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
          {allOrders.map((itm) => {
            const isActive = itm.id === activeId;
            const isDone = itm.status === 'COMPLETED';
            
            return (
              <button
                key={itm.id}
                onClick={() => onSelectOrder(itm.id)}
                className={cn(
                  "w-full text-left p-4 transition-all flex items-center gap-3 group",
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
    </div>
  );
}
