'use client';

import { useTranslations } from 'next-intl';
import { CalendarBlankIcon, PlusIcon } from '@phosphor-icons/react';
import { useRouter } from '@/i18n/navigation';

interface BookingEmptyStateProps {
  activeTab: string;
}

export function BookingEmptyState({ activeTab }: BookingEmptyStateProps) {
  const t = useTranslations('booking');
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <CalendarBlankIcon size={32} className="text-slate-300" weight="bold" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">
        {t('noBookingsFound')}
      </h3>
      <p className="text-sm text-slate-400 max-w-[260px]">
        {t('noBookingsDescription')}
      </p>
      {activeTab === 'upcoming' && (
        <button
          onClick={() => router.push('/patient/book')}
          className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1570EF] text-white text-sm font-semibold rounded-xl hover:bg-[#0F5ED4] transition-colors cursor-pointer"
        >
          <PlusIcon size={16} weight="bold" />
          {t('bookNewAppointment')}
        </button>
      )}
    </div>
  );
}
