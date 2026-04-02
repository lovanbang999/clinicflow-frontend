'use client';


import { useTranslations } from 'next-intl';
import { CheckCircleIcon, MoneyIcon, SpinnerIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

export function CompletedBooking() {
  const t = useTranslations('receptionistWalkinBooking.success');
  const router = useRouter();
  const { selectedPatient, completedBooking, handleReset } = useWalkinBooking();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePay = async () => {
    if (!completedBooking?.id) {
      router.push('/receptionist/billing');
      return;
    }

    try {
      setIsRedirecting(true);
      // Phương án B: redirect to the booking invoices page
      router.push(`/receptionist/billing/booking/${completedBooking.id}`);
    } catch (error) {
      console.error('Failed to redirect to billing:', error);
      router.push('/receptionist/billing');
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mt-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon size={32} weight="fill" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{t('title')}</h2>
        <p className="text-slate-500 mt-2">{t('message')}</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <div className="text-center pb-4 border-b border-dashed border-slate-300 mb-4">
          <h3 className="font-bold text-lg text-[#1570EF]">{t('clinicName')}</h3>
          <p className="text-sm text-slate-500">{t('receiptTitle')}</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">{t('patientLabel')}</span>
            <span className="font-semibold text-slate-800">{selectedPatient?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t('receptionistLabel')}</span>
            <span className="font-semibold text-slate-800">{t('receptionistName')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePay}
          disabled={isRedirecting}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1392ec] text-white py-2.5 rounded-lg font-medium hover:bg-[#1180d0] transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isRedirecting ? <SpinnerIcon className="animate-spin" size={18} /> : <MoneyIcon size={18} />}
          {t('payBtn')}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer"
        >
          {t('newBookingBtn')}
        </button>
      </div>
    </div>
  );
}
