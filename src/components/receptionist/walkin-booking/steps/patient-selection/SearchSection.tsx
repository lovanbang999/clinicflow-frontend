'use client';

import { useTranslations } from 'next-intl';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../../WalkinBookingContext';

export function SearchSection() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.patient');
  const {
    searchQuery,
    setSearchQuery,
    handleSearchPatient,
    isSearching,
    setShowCreateForm
  } = useWalkinBooking();

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="text-slate-400" size={18} />
        </div>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-[14px] focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-shadow shadow-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
        />
      </div>
      <button
        onClick={() => handleSearchPatient(1)}
        disabled={isSearching}
        className="h-11 px-5 bg-[#1570EF] text-white rounded-xl text-sm font-bold hover:bg-[#0F5ED4] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer"
      >
        {isSearching ? '...' : t('searchBtn')}
      </button>
      <button
        type="button"
        onClick={() => setShowCreateForm(true)}
        className="h-11 px-5 border-2 border-[#1570EF] text-[#1570EF] rounded-xl text-sm font-bold hover:bg-[#EFF4FF] transition-colors flex items-center justify-center min-w-[102px] cursor-pointer whitespace-nowrap"
      >
        {t('createBtn')}
      </button>
    </div>
  );
}
