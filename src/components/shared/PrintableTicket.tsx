'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export interface TicketData {
  patientName: string;
  patientCode: string;
  queueNumber: string | number;
  roomName: string;
  doctorName?: string;
  serviceName: string;
  type: 'CONSULTATION' | 'LAB';
  date: Date;
}

export function PrintableTicket({ ticket }: { ticket: TicketData | null }) {
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const t = useTranslations('doctorWorkspace.printables.ticket');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !ticket) return null;

  const content = (
    <div id="printable-ticket" className="hidden print:block font-sans text-sm pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Hide EVERYTHING on the page except the printable ticket */
          body > * {
            display: none !important;
          }
          #printable-ticket {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 1.5cm !important;
            z-index: 99999 !important;
          }
          #printable-ticket * {
            visibility: visible !important;
          }
        }
      `}} />
      <div 
        className="mx-auto border-2 border-slate-950 border-dashed bg-white text-black p-8 mt-4"
        style={{ width: '100%', maxWidth: '380px' }}
      >
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tighter">{t('clinicName')}</h1>
          <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tight">Hệ thống quản lý phòng khám thông minh</p>
          <p className="text-[10px] text-slate-500 mt-1">{t('address')}</p>
        </div>

        {/* Ticket Number */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">
            {ticket.type === 'CONSULTATION' ? t('titleConsult') : t('titleLab')}
          </h2>
          <div className="text-7xl font-black text-slate-900 mb-2 py-4 bg-slate-50 border border-slate-200 rounded-2xl">
            {ticket.queueNumber}
          </div>
          <p className="text-base font-black text-slate-900 uppercase">
             {ticket.serviceName}
          </p>
          <p className="text-xs font-bold text-slate-700 mt-1">
            {t('doctor')}: {ticket.doctorName || 'N/A'}
          </p>
          <p className="text-xs font-black text-slate-900 mt-1">
            {t('room')}: {ticket.roomName}
          </p>
        </div>

        {/* Info Grid */}
        <div className="text-xs space-y-3 mb-8 border-t-2 border-slate-900 border-dotted pt-6">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">{t('fullName')}</span>
            <span className="font-black text-slate-950 text-right uppercase">
              {ticket.patientName}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">{t('code')}</span>
            <span className="font-mono font-black text-slate-950">{ticket.patientCode}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 font-bold uppercase text-[9px]">{t('printTime')}</span>
            <span className="font-black text-slate-950">{format(ticket.date, 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}</span>
          </div>
        </div>

        {/* Instruction Footer */}
        <div className="bg-slate-50 px-4 py-5 rounded-xl border border-slate-200 text-center">
          <p className="text-[11px] font-black text-slate-900 leading-relaxed uppercase">
            VUI LÒNG ĐỢI GỌI TÊN/SỐ TRƯỚC PHÒNG KHÁM
          </p>
          <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase">
            XIN CẢM ƠN QUÝ KHÁCH
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest">
          SmartClinic - Powered by ANTIGRAVITY
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
