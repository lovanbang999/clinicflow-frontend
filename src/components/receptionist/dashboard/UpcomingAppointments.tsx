'use client';

import { useTranslations } from 'next-intl';
import { CalendarPlusIcon, UserCheckIcon } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceptionistDashboard } from '@/lib/hooks/useReceptionistDashboard';
import { cn } from '@/lib/utils';
import { BookingStatus } from '@/types';

export function UpcomingAppointments() {
  const t = useTranslations('dashboard.receptionist.upcomingAppointments');
  const tCommon = useTranslations('common');
  const { upcomingBookings, loadingUpcoming, checkIn, isCheckingIn } = useReceptionistDashboard();

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarPlusIcon className="text-slate-400 h-5 w-5" weight="bold" />
          <h3 className="font-bold text-slate-900">{t('title')}</h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.time')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.patient')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.service')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.doctor')}</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('table.status')}</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">{tCommon?.('actions') ?? 'Thao tác'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingUpcoming ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                </tr>
              ))
            ) : upcomingBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {tCommon?.('noData') ?? 'Không có lịch hẹn nào sắp tới'}
                </td>
              </tr>
            ) : (
              upcomingBookings.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900">{app.startTime || '--:--'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{app.patientProfile?.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{app.patientProfile?.patientCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{app.service?.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500 font-medium">{app.doctor?.fullName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                      app.status === BookingStatus.CONFIRMED ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => checkIn(app.id)}
                      disabled={isCheckingIn}
                      className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <UserCheckIcon weight="fill" size={14} />
                      Check-in
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
