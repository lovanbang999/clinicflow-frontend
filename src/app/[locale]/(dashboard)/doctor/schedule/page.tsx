'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DoctorWorkingHoursGrid } from '@/components/admin/doctors/DoctorWorkingHoursGrid';
import { DoctorOffDayCalendar } from '@/components/admin/doctors/DoctorOffDayCalendar';
import { CalendarBlankIcon, ClockIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

type Tab = 'working-hours' | 'off-days';

const TABS: { key: Tab; label: string; icon: typeof ClockIcon }[] = [
  { key: 'working-hours', label: 'Lịch làm việc', icon: ClockIcon },
  { key: 'off-days',      label: 'Đăng ký nghỉ',   icon: CalendarBlankIcon },
];

export default function DoctorSchedulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('working-hours');
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Đang tải thông tin…
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="mx-auto p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý lịch</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thiết lập giờ làm việc và đăng ký ngày nghỉ của bạn.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
              activeTab === key
                ? 'bg-white dark:bg-slate-900 text-[#1392ec] shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            <Icon size={15} weight={activeTab === key ? 'duotone' : 'regular'} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'working-hours' && (
        <DoctorWorkingHoursGrid doctorId={user.id} />
      )}
      {activeTab === 'off-days' && (
        <DoctorOffDayCalendar doctorId={user.id} />
      )}
      </div>
    </div>
  );
}
