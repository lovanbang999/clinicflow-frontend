'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircleIcon, PrinterIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';

export function CompletedBooking() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.success');
  const printRef = useRef<HTMLDivElement>(null);
  const { selectedPatient, handleReset } = useWalkinBooking();

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
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

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8" ref={printRef}>
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
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1570EF] text-white py-2.5 rounded-lg font-medium hover:bg-[#0F5ED4] transition cursor-pointer"
        >
          <PrinterIcon size={18} />
          {t('printBtn')}
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
