'use client';

import { useTranslations } from 'next-intl';
import { UserPlusIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../../WalkinBookingContext';

export function PatientNotFound() {
  const t = useTranslations('receptionistWalkinBooking.patient');
  const { searchQuery, setShowCreateForm } = useWalkinBooking();

  return (
    <div className="bg-[#EFF4FF] border border-[#D1E0FF] rounded-2xl p-6 flex flex-col items-center justify-center gap-5 text-center mt-2 shadow-sm animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1570EF] shadow-md mb-2 border-4 border-[#EFF4FF]">
          <UserPlusIcon size={28} weight="bold" />
        </div>
        <h4 className="text-[16px] font-bold text-slate-900">{t('notFoundTitle')}</h4>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {t('notFoundDescPrefix')} <b className="text-[#1570EF] font-bold ring-2 ring-[#EFF4FF] px-1.5 rounded">{searchQuery}</b>
        </p>
      </div>
      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full sm:w-auto px-8 py-3 bg-[#1570EF] text-white rounded-xl text-sm font-bold hover:bg-[#0F5ED4] transition-all shadow-lg shadow-[#1570EF]/20 active:scale-[0.98] cursor-pointer"
      >
        {t('registerNew')}
      </button>
    </div>
  );
}
