'use client';

import { useTranslations } from 'next-intl';
// import { StethoscopeIcon, FlaskIcon, CheckCircleIcon } from '@phosphor-icons/react'; // HIDDEN: FlaskIcon used by Direct Service
import { StethoscopeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';

export function ModeToggle() {
  const t = useTranslations('receptionistWalkinBooking.modeToggle');
  const { bookingMode, setBookingMode } = useWalkinBooking();

  const isConsultation = bookingMode === 'CONSULTATION';
  // const isDirectService = bookingMode === 'DIRECT_SERVICE'; // HIDDEN: Direct Service flow

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {/* Mode A — Consultation */}
      <button
        type="button"
        onClick={() => setBookingMode('CONSULTATION')}
        className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
          isConsultation
            ? 'border-[#1570EF] bg-[#EFF4FF]/60 shadow-md shadow-[#1570EF]/10'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {isConsultation && (
          <span className="absolute top-3 right-3">
            <CheckCircleIcon size={18} weight="fill" className="text-[#1570EF]" />
          </span>
        )}

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
          isConsultation ? 'bg-[#1570EF]' : 'bg-slate-100'
        }`}>
          <StethoscopeIcon
            size={18}
            weight="fill"
            className={isConsultation ? 'text-white' : 'text-slate-500'}
          />
        </div>

        <p className={`text-[14px] font-bold mb-1 ${isConsultation ? 'text-slate-900' : 'text-slate-700'}`}>
          {t('consultationTitle')}
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
          {t('consultationDesc')}
        </p>
        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
          isConsultation
            ? 'bg-[#1570EF]/10 text-[#1570EF]'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {t('consultationTag')}
        </span>
      </button>

      {/* HIDDEN: Mode B — Direct Service (re-enable when flow is ready) */}
      {/* <button
        type="button"
        onClick={() => setBookingMode('DIRECT_SERVICE')}
        className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
          isDirectService
            ? 'border-[#1570EF] bg-[#EFF4FF]/60 shadow-md shadow-[#1570EF]/10'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {isDirectService && (
          <span className="absolute top-3 right-3">
            <CheckCircleIcon size={18} weight="fill" className="text-[#1570EF]" />
          </span>
        )}

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
          isDirectService ? 'bg-[#1570EF]' : 'bg-slate-100'
        }`}>
          <FlaskIcon
            size={18}
            weight="fill"
            className={isDirectService ? 'text-white' : 'text-slate-500'}
          />
        </div>

        <p className={`text-[14px] font-bold mb-1 ${isDirectService ? 'text-slate-900' : 'text-slate-700'}`}>
          {t('directServiceTitle')}
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
          {t('directServiceDesc')}
        </p>
        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
          isDirectService
            ? 'bg-[#1570EF]/10 text-[#1570EF]'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {t('directServiceTag')}
        </span>
      </button> */}
    </div>
  );
}
