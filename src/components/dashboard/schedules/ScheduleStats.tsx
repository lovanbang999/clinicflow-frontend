'use client';

import { useTranslations } from 'next-intl';
import {
  CalendarCheckIcon,
  CalendarIcon,
  CalendarXIcon,
  HourglassMediumIcon,
  DotsThreeVerticalIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useAdminSchedules } from '@/lib/hooks/useAdminSchedules';
import { Skeleton } from '@/components/ui/skeleton';

export function ScheduleStats() {
  const t = useTranslations('dashboard.scheduleManagement');
  const { stats, loadingStats, fetchStats } = useAdminSchedules();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 rounded-2xl shadow-sm border-[#e5e7eb] flex flex-col justify-between py-6 gap-0">
        <div className="flex justify-between items-start">
          <div className="size-10 rounded-lg bg-blue-50 text-[#1392ec] flex items-center justify-center border border-blue-100">
            <CalendarCheckIcon size={24} weight="fill" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:text-[#1392ec] hover:bg-blue-50/50 transition-colors cursor-pointer">
            <DotsThreeVerticalIcon size={20} weight="bold" />
          </Button>
        </div>
        <div className="mt-4">
          <p className="text-[#64748b] text-sm font-medium">{t('stats.totalAppointments')}</p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-[#111518] mt-1">{stats?.totalAppointments || 0}</h3>
          )}
        </div>
      </Card>
      
      <Card className="p-6 rounded-2xl shadow-sm border-[#e5e7eb] flex flex-col justify-between py-6 gap-0">
        <div className="flex justify-between items-start">
          <div className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CalendarIcon size={24} weight="fill" />
          </div>
          <span className="flex items-center gap-1 text-[#078838] bg-[#078838]/10 px-2 py-0.5 rounded-full text-xs font-bold">
            +12%
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[#64748b] text-sm font-medium">{t('stats.todaysSlots')}</p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-[#111518] mt-1">{stats?.todaysSlots || 0}</h3>
          )}
        </div>
      </Card>

      <Card className="p-6 rounded-2xl shadow-sm border-[#e5e7eb] flex flex-col justify-between py-6 gap-0">
        <div className="flex justify-between items-start">
          <div className="size-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <CalendarXIcon size={24} weight="fill" />
          </div>
          <span className="flex items-center gap-1 text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded-full text-xs font-bold">
            {t('stats.low')}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[#64748b] text-sm font-medium">{t('stats.canceledToday')}</p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-[#111518] mt-1">{stats?.canceledToday || 0}</h3>
          )}
        </div>
      </Card>

      <Card className="p-6 rounded-2xl shadow-sm border-[#e5e7eb] flex flex-col justify-between py-6 gap-0">
        <div className="flex justify-between items-start">
          <div className="size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <HourglassMediumIcon size={24} weight="fill" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:text-[#1392ec] hover:bg-amber-50/50 transition-colors cursor-pointer">
            <InfoIcon size={20} weight="bold" />
          </Button>
        </div>
        <div className="mt-4">
          <p className="text-[#64748b] text-sm font-medium">{t('stats.avgWaitTime')}</p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-[#111518] mt-1">{stats?.avgWaitTime || 0}m</h3>
          )}
        </div>
      </Card>
    </div>
  );
}
