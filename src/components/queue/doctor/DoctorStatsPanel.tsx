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
import { StatCard } from '@/components/ui/StatCard';

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
      <StatCard
        icon={<HourglassHighIcon size={20} weight="fill" />}
        iconBg="bg-blue-50 text-blue-600"
        label={t('statsPanel.waiting')}
        value={pendingActive}
      />
      <StatCard
        icon={<UserCheckIcon size={20} weight="fill" />}
        iconBg="bg-green-50 text-green-600"
        label={t('statsPanel.completedToday')}
        value={patientsSeenToday}
      />
      <StatCard
        icon={<WarningCircleIcon size={20} weight="fill" />}
        iconBg="bg-red-50 text-red-600"
        label={t('statsPanel.abnormalResults')}
        value={abnormalResultsToday}
      />
      <StatCard
        icon={<UsersIcon size={20} weight="fill" />}
        iconBg="bg-indigo-50 text-indigo-600"
        label={t('statsPanel.totalPatients')}
        value={totalPatientsSeen}
      />
      <StatCard
        icon={<TimerIcon size={20} weight="fill" />}
        iconBg={isHigh ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}
        label={t('statsPanel.avgWaitTime')}
        value={
          <span className={isHigh ? 'text-red-600' : 'text-gray-900'}>
            {avgWaitMins} {t('minutes')}
          </span>
        }
        borderClass={isHigh ? 'border-red-100' : 'border-gray-100'}
      />
    </div>
  );
}
