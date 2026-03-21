'use client';

import { useTranslations } from 'next-intl';
import {
  UsersIcon,
  ClockIcon,
  ArrowRightIcon,
  TimerIcon,
  ProhibitIcon,
  CheckIcon
} from '@phosphor-icons/react';
import { useQueue } from '@/lib/hooks/useQueue';
import { BookingStatus } from '@/types';

interface QueueBoardProps {
  doctorId?: string;
  doctorName?: string;
  isDoctorView?: boolean;
}

export function QueueBoard({ doctorId, doctorName, isDoctorView = false }: QueueBoardProps) {
  const t = useTranslations('dashboard.queue');
  
  const {
    queueItems,
    stats,
    isLoading,
    isConnected,
    callPatient,
    markNoShow
  } = useQueue(doctorId);

  const handleCallPatient = async (bookingId: string) => {
    await callPatient(bookingId);
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (!window.confirm(t('markNoShow') + '?')) return;
    await markNoShow(bookingId);
  };

  const handleCompleteVisit = async (_bookingId: string) => {
    // Note: completion is now typically handled via the EMR form in the doctor workspace.
    // If called from here (e.g. receptionist view), we might want different behavior,
    // but we're removing the doctor-specific redirection to the consultation page.
  };

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CHECKED_IN:
        return { color: 'bg-blue-100 text-blue-700 font-bold border-blue-200', text: t('status.waiting') };
      case BookingStatus.IN_PROGRESS:
        return { color: 'bg-emerald-100 text-emerald-700 font-bold border-emerald-200 animate-pulse', text: t('status.examining') };
      case BookingStatus.COMPLETED:
        return { color: 'bg-slate-100 text-slate-500 font-medium border-slate-200', text: t('status.completed') };
      case BookingStatus.NO_SHOW:
        return { color: 'bg-rose-50 text-rose-600 font-bold border-rose-100', text: t('status.noShow') };
      default:
        // Try translating via status key if defined
        return { color: 'bg-slate-50 text-slate-400', text: status };
    }
  };

  if (!doctorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
        <UsersIcon size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">{t('selectDoctor')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <UsersIcon size={24} weight="fill" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{t('stats.totalInQueue')}</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalQueued || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <ClockIcon size={24} weight="fill" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{t('stats.avgWaitTime')}</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.averageWaitTimeMinutes || 0} {t('timeUnit.minutes')}
            </p>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-slate-900">
              {t('boardTitle', { doctor: doctorName || '' })}
            </h3>
          </div>
          {isConnected ? (
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Live</span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Offline</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4 w-20 text-center">STT</th>
                <th className="px-6 py-4">{t('table.patient')}</th>
                <th className="px-6 py-4">{t('table.status')}</th>
                <th className="px-6 py-4">{t('table.waitTime')}</th>
                <th className="px-6 py-4 text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(!Array.isArray(queueItems) || queueItems.length === 0) && !isLoading ? (
                <tr>
                  <td colSpan={isDoctorView ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">{t('noData')}</p>
                  </td>
                </tr>
              ) : (Array.isArray(queueItems) ? (
                queueItems.map((item) => {
                  const statusConfig = getStatusConfig(item.booking.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex w-10 h-10 items-center justify-center rounded-xl text-lg font-bold ${item.booking.status === BookingStatus.IN_PROGRESS ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-600'}`}>
                          {item.queuePosition}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{item.booking.patientProfile?.fullName || 'N/A'}</p>
                          <p className="text-xs text-slate-400 font-medium">{item.booking.bookingCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs border ${statusConfig.color}`}>
                          {statusConfig.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <TimerIcon size={16} />
                          <span className="text-sm font-medium">~{item.estimatedWaitMinutes} {t('timeUnit.minutes')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {isDoctorView && item.booking.status === BookingStatus.IN_PROGRESS && (
                            <button
                              onClick={() => handleCompleteVisit(item.booking.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                            >
                              {t('completeVisit')}
                              <CheckIcon size={14} weight="bold" />
                            </button>
                          )}

                          {isDoctorView && item.booking.status === BookingStatus.CHECKED_IN && (
                            <button 
                              onClick={() => handleCallPatient(item.booking.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                            >
                              {t('callPatient')}
                              <ArrowRightIcon size={14} weight="bold" />
                            </button>
                          )}
                          
                          {item.booking.status === BookingStatus.CHECKED_IN && (
                            <button
                              onClick={() => handleMarkNoShow(item.booking.id)}
                              className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors cursor-pointer"
                              title={t('markNoShow')}
                            >
                              <ProhibitIcon size={18} weight="bold" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : null)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
