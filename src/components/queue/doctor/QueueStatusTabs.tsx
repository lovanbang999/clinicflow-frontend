'use client';

import { useTranslations } from 'next-intl';
import { BookingStatus } from '@/types';

export type FilterType =
  | 'IN_EXAM'
  | 'WAITING_RESULTS'
  | BookingStatus.CHECKED_IN
  | BookingStatus.COMPLETED
  | BookingStatus.NO_SHOW;

interface QueueStatusTabsProps {
  active: FilterType;
  onChange: (id: FilterType) => void;
  stats: {
    waiting: number;
    inExam: number;
    waitingResults: number;
    completed: number;
    noShow: number;
  };
}

export function QueueStatusTabs({ active, onChange, stats }: QueueStatusTabsProps) {
  const t = useTranslations('doctorWorkspace.queueView');
  const tabs = [
    { id: BookingStatus.CHECKED_IN, label: t('stats.waiting'), count: stats.waiting },
    { id: 'IN_EXAM', label: t('stats.inExam'), count: stats.inExam },
    { id: 'WAITING_RESULTS', label: t('stats.waitingResults'), count: stats.waitingResults },
    { id: BookingStatus.COMPLETED, label: t('stats.completed'), count: stats.completed },
    { id: BookingStatus.NO_SHOW, label: t('stats.noShow'), count: stats.noShow },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-[#f3f4f9] rounded-xl w-fit overflow-x-auto no-scrollbar border border-[#e2e2e9]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as FilterType)}
          className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${active === tab.id ? 'bg-white shadow-md text-[#1275e2]' : 'text-[#44474e] hover:bg-white/50'
            }`}
        >
          {tab.label}
          <span
            className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold ${active === tab.id ? 'bg-[#1275e2] text-white' : 'bg-[#e2e2e9] text-[#44474e]'
              }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
