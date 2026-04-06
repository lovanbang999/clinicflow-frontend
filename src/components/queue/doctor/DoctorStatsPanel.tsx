'use client';

import { useApiData } from '@/lib/hooks/core/useApiData';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import {
  UsersIcon,
  UserCheckIcon,
  HourglassHighIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';

export function DoctorStatsPanel() {
  const { data, isLoading } = useApiData(medicalRecordsApi.getDoctorStats, null);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
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

  const { totalPatientsSeen, patientsSeenToday, pendingActive, abnormalResultsToday } = data;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <HourglassHighIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{pendingActive}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Đang chờ khám</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
          <UserCheckIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{patientsSeenToday}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Đã khám hsni</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <WarningCircleIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{abnormalResultsToday}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">CLS bất thường</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <UsersIcon size={20} weight="fill" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{totalPatientsSeen}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Tổng bệnh nhân</p>
        </div>
      </div>
    </div>
  );
}
