'use client';

import { useApiData } from '@/lib/hooks/core/useApiData';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import {
  UsersIcon,
  UserCheckIcon,
  HourglassHighIcon,
  WarningCircleIcon,
  TimerIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export function DoctorStatsPanel({ avgWaitMins }: { avgWaitMins: number }) {
  const t = useTranslations('doctorWorkspace.queueView');
  const isHigh = avgWaitMins > 30;
  const { data, isLoading } = useApiData(medicalRecordsApi.getDoctorStats, null);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { patientsSeenToday, totalPatientsSeen, pendingActive, abnormalResultsToday } = data;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 transition-transform hover:translate-y-[-2px] hover:shadow-md cursor-default">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <HourglassHighIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{pendingActive}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1">Đang chờ khám</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 transition-transform hover:translate-y-[-2px] hover:shadow-md cursor-default">
        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
          <UserCheckIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{patientsSeenToday}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1">Đã khám xong</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 transition-transform hover:translate-y-[-2px] hover:shadow-md cursor-default">
        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <WarningCircleIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{abnormalResultsToday}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1">CLS bất thường</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 transition-transform hover:translate-y-[-2px] hover:shadow-md cursor-default">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <UsersIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{totalPatientsSeen}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1">Tổng bệnh nhân</p>
        </div>
      </div>

      <div className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-3 transition-transform hover:translate-y-[-2px] hover:shadow-md cursor-default ${isHigh ? 'border-red-100' : 'border-gray-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isHigh ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          <TimerIcon size={20} weight="fill" />
        </div>
        <div>
          <p className={`text-xl font-bold leading-none ${isHigh ? 'text-red-600' : 'text-gray-900'}`}>{avgWaitMins} phút</p>
          <p className="text-[10px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">{t('avgWaitTime')}</p>
        </div>
      </div>
    </div>
  );
}
