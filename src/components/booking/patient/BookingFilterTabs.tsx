'use client';

import { useTranslations } from 'next-intl';
import { BookingStatus } from '@/types';

export type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface BookingFilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

const TABS: { key: FilterTab; labelKey: string }[] = [
  { key: 'all',       labelKey: 'all' },
  { key: 'upcoming',  labelKey: 'upcoming' },
  { key: 'completed', labelKey: 'completed' },
  { key: 'cancelled', labelKey: 'cancelled' },
];

export function BookingFilterTabs({ activeTab, onTabChange, counts }: BookingFilterTabsProps) {
  const t = useTranslations('booking');

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(({ key, labelKey }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              isActive
                ? 'bg-[#1570EF] border-[#1570EF] text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#1570EF] dark:hover:border-[#1570EF] hover:text-[#1570EF] dark:hover:text-blue-400'
            }`}
          >
            {t(labelKey)}
            {counts[key] > 0 && (
              <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center leading-none ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Shared helpers */

export function filterByTab<T extends { status: BookingStatus }>(items: T[], tab: FilterTab): T[] {
  switch (tab) {
    case 'upcoming':
      return items.filter((b) =>
        [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.QUEUED, BookingStatus.IN_PROGRESS].includes(b.status)
      );
    case 'completed':
      return items.filter((b) => b.status === BookingStatus.COMPLETED);
    case 'cancelled':
      return items.filter((b) => [BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(b.status));
    default:
      return items;
  }
}

export function computeCounts<T extends { status: BookingStatus }>(items: T[]): Record<FilterTab, number> {
  return {
    all:       items.length,
    upcoming:  filterByTab(items, 'upcoming').length,
    completed: filterByTab(items, 'completed').length,
    cancelled: filterByTab(items, 'cancelled').length,
  };
}
