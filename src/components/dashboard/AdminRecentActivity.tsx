'use client';

import {
  UserPlusIcon,
  CalendarCheckIcon,
  CurrencyCircleDollarIcon,
  XCircleIcon,
  FirstAidKitIcon,
  UserIcon,
  CalendarPlusIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function AdminRecentActivity() {
  const t = useTranslations('adminOverview.recentActivity');
  const { notifications, loading } = useNotifications();

  // Filter for admin activity only
  const adminActivities = notifications
    .filter((n) => n.type === 'ADMIN_ACTIVITY')
    .slice(0, 8); // Showing latest 8

  const getIconConfig = (title: string) => {
    if (title.includes('Thành viên mới'))
      return { icon: UserPlusIcon, color: 'bg-blue-50 text-[#1392ec]' };
    if (title.includes('Lịch hẹn mới'))
      return { icon: CalendarPlusIcon, color: 'bg-teal-50 text-teal-600' };
    if (title.includes('xác nhận'))
      return { icon: ShieldCheckIcon, color: 'bg-indigo-50 text-indigo-600' };
    if (title.includes('check-in'))
      return { icon: CheckCircleIcon, color: 'bg-blue-50 text-blue-600' };
    if (title.includes('hoàn thành'))
      return { icon: CalendarCheckIcon, color: 'bg-emerald-50 text-emerald-600' };
    if (title.includes('hủy'))
      return { icon: XCircleIcon, color: 'bg-rose-50 text-rose-500' };
    if (title.includes('Thanh toán'))
      return {
        icon: CurrencyCircleDollarIcon,
        color: 'bg-amber-50 text-amber-600',
      };

    return { icon: FirstAidKitIcon, color: 'bg-purple-50 text-purple-600' };
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-[#111518]">{t('title')}</h3>
          <p className="text-[#94a3b8] text-xs font-medium mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1392ec]"></div>
        </div>
      ) : adminActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <UserIcon weight="fill" className="text-slate-300 text-2xl" />
          </div>
          <p className="text-sm text-slate-400">{t('noActivity')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
          {adminActivities.map((activity) => {
            const config = getIconConfig(activity.title);
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}
                >
                  <config.icon weight="fill" className="text-[16px]" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-[#111518] truncate">
                    {activity.content}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    {activity.title} •{' '}
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
