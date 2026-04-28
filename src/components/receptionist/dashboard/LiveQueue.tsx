'use client';

import { useTranslations } from 'next-intl';
import { MonitorPlayIcon, ArrowUpIcon } from '@phosphor-icons/react';
import { useReceptionistDashboard } from '@/lib/hooks/receptionist/useReceptionistDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BookingStatus } from '@/types';

export function LiveQueue() {
  const t = useTranslations('receptionistOverview.liveQueue');
  const { queueRecords, loadingQueue, promoteQueue } = useReceptionistDashboard();

  return (
    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MonitorPlayIcon className="text-red-500 h-5 w-5" weight="fill" />
          <h3 className="font-bold text-slate-900">{t('title', { count: queueRecords.length })}</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-md">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
           </span>
           <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{t('liveLabel')}</span>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
        {loadingQueue && queueRecords.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : queueRecords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <MonitorPlayIcon className="text-slate-200 h-10 w-10" />
            </div>
            <p className="text-slate-400 text-sm font-medium">{t('empty')}</p>
          </div>
        ) : (
          queueRecords.map((record) => (
            <div 
              key={record.id} 
              className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div 
                className={cn(
                  "w-12 h-12 rounded-xl font-bold flex flex-col items-center justify-center shrink-0 border transition-all",
                  record.booking.status === BookingStatus.IN_PROGRESS 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                    : record.booking.status === BookingStatus.AWAITING_RESULTS
                    ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200"
                    : "bg-white text-slate-900 border-slate-100"
                )}
              >
                <span className="text-lg leading-none">{record.queuePosition}</span>
                <span className="text-[9px] uppercase mt-0.5 opacity-80 font-black">No.</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 truncate">{record.booking.patientProfile?.fullName}</p>
                  {record.isPreBooked && (
                     <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{t('preBooked')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[11px] text-slate-400 font-medium truncate">
                     {record.booking.doctor?.fullName}
                   </p>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <p className="text-[11px] text-slate-500 font-bold truncate">
                     {t('waitMin', { min: record.estimatedWaitMinutes })}
                   </p>
                </div>
              </div>

              {record.booking.status !== BookingStatus.IN_PROGRESS && record.booking.status !== BookingStatus.AWAITING_RESULTS && (
                <button 
                  onClick={() => promoteQueue(record.bookingId)}
                  title={t('promoteBtn')}
                  className="w-10 h-10 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg flex items-center justify-center transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                >
                  <ArrowUpIcon weight="bold" size={18} />
                </button>
              )}
              
              {record.booking.status === BookingStatus.IN_PROGRESS && (
                 <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                   {t('inProgress')}
                 </div>
              )}

              {record.booking.status === BookingStatus.AWAITING_RESULTS && (
                 <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider text-center">
                   🧪 Lab
                 </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
