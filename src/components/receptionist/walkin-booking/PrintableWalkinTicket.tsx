'use client';

import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Booking } from '@/types';

interface PrintableWalkinTicketProps {
  booking: Booking;
  queue?: {
    queuePosition: number;
  };
}

export function PrintableWalkinTicket({ booking, queue }: PrintableWalkinTicketProps) {
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const t = useTranslations('doctorWorkspace.printables.ticket');

  return (
    <div id="printable-ticket" className="hidden print:block font-sans text-sm pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          body {
            background-color: white !important;
          }
        }
      `}} />
      <div 
        className="mx-auto border-2 border-slate-950 border-dashed bg-white text-black p-8 mt-4"
        style={{ width: '100%', maxWidth: '380px' }}
      >
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">{t('clinicName')}</h1>
          <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tight">Hệ thống quản lý phòng khám thông minh</p>
          <p className="text-[10px] text-slate-500 mt-1">{t('address')}</p>
        </div>

        {/* Ticket Number */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">{t('title')}</h2>
          <div className="text-7xl font-black text-slate-900 mb-2 py-4 bg-slate-50 border border-slate-200 rounded-2xl">
            {queue?.queuePosition || '---'}
          </div>
          <p className="text-base font-black text-slate-900 uppercase">
             {booking.service?.name || 'KHÁM TỔNG QUÁT'}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1">
            {t('doctor')}: {booking.doctor?.fullName || 'N/A'}
          </p>
          {booking.room && (
            <p className="text-xs font-black text-slate-900 mt-1">
              {t('room')}: {booking.room.name}
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div className="text-xs space-y-3 mb-8 border-t-2 border-slate-900 border-dotted pt-6">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">{t('fullName')}</span>
            <span className="font-black text-slate-950 text-right uppercase">
              {booking.patientProfile?.fullName}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">Mã đặt lịch</span>
            <span className="font-mono font-black text-slate-950">{booking.bookingCode || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">Số điện thoại</span>
            <span className="font-black text-slate-950">{booking.patientProfile?.phone || '—'}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">{t('printTime')}</span>
            <span className="font-black text-slate-950">{format(new Date(), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}</span>
          </div>
        </div>

        {/* Instruction Footer */}
        <div className="bg-slate-50 px-4 py-5 rounded-xl border border-slate-200 text-center">
          <p className="text-[11px] font-black text-slate-900 leading-relaxed uppercase">
            {t('instruction1')}
          </p>
          <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase">
            {t('instruction2')}
          </p>
          <p className="text-[10px] text-slate-600 mt-3 italic font-bold">
            {t('greeting')}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest">
          SmartClinic - Powered by ANTIGRAVITY
        </div>
      </div>
    </div>
  );
}
