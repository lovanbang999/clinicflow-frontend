'use client';

import { useTranslations } from 'next-intl';
import { UserIcon, CheckCircleIcon, PhoneCallIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../../WalkinBookingContext';

export function SelectedPatientProfile() {
  const t = useTranslations('receptionistWalkinBooking.patient');
  const { selectedPatient, setCurrentStep } = useWalkinBooking();

  if (!selectedPatient) return null;

  return (
    <div className="border-2 border-slate-200 hover:bg-white hover:border-[#1570EF] rounded-2xl p-4 flex items-center gap-5 shadow-xl shadow-[#1570EF]/5 w-full max-w-[600px] animate-in fade-in slide-in-from-top-2 duration-300 relative group overflow-hidden">
      <div className="w-14 h-14 rounded-full bg-[#EFF4FF] border-2 border-[#D1E0FF] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
        <UserIcon size={30} className="text-[#1570EF]" weight="bold" />
      </div>
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[12px] font-bold text-[#1570EF] bg-[#EFF4FF] px-2.5 py-1 rounded-lg border border-[#D1E0FF] uppercase shadow-sm">
            ID: {selectedPatient.patientProfile?.patientCode || selectedPatient.id.slice(0, 6).toUpperCase()}
          </span>
          <h4 className="font-extrabold text-slate-900 text-[17px] truncate tracking-tight">{selectedPatient.fullName}</h4>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-slate-600 font-semibold">
          <div className="flex items-center gap-2">
            <PhoneCallIcon size={16} className="text-[#1570EF]" weight="bold" /> {selectedPatient.phone}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0 z-10">
        <CheckCircleIcon weight="fill" className="text-[#1570EF] w-5 h-5 inline ml-1" />

        <button
          onClick={() => setCurrentStep(1)}
          className="text-xs font-bold text-[#1570EF] hover:text-[#0F5ED4] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline"
        >
          <PencilSimpleIcon size={12} weight="bold" /> {t('changeBtn')}
        </button>
      </div>
    </div>
  );
}
