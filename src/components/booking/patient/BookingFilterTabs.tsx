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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-[0.97] cursor-pointer ${
              isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-755'
            }`}
          >
            {t(labelKey)}
            {counts[key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold leading-none ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
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
