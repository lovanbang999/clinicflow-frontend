'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export interface TicketItem {
  serviceName: string;
  roomName: string;
  queueNumber: string | number;
  suggestedOrder?: number;
  preparationNotes?: string;
  type: 'CONSULTATION' | 'LAB';
}

export interface TicketData {
  patientName: string;
  patientCode: string;
  doctorName?: string;
  items: TicketItem[];
  date: Date;
  estimatedDuration?: number;
  completedBefore?: string;
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

  // Sort items by suggestedOrder if available
  const sortedItems = [...ticket.items].sort((a, b) =>
    (a.suggestedOrder ?? 99) - (b.suggestedOrder ?? 99)
  );

  const content = (
    <div id="printable-ticket" className="hidden print:block font-sans text-sm pb-10">
      <style dangerouslySetInnerHTML={{
        __html: `
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
            padding: 1cm !important;
            z-index: 99999 !important;
          }
          #printable-ticket * {
            visibility: visible !important;
          }
        }
      `}} />

      <div
        className="mx-auto border-2 border-dashed border-slate-400 bg-white text-black p-8 mt-4"
        style={{ width: '100%', maxWidth: '440px' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-black uppercase tracking-tight">{t('clinicName')}</h1>
          <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">{t('clinicSub')}</p>
          <p className="text-[9px] text-slate-500 mt-1">{t('address')}</p>
          <div className="mt-3 border-b-2 border-black w-2/3 mx-auto"></div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
            {ticket.items.length > 1 ? t('multiTitle') : (ticket.items[0]?.type === 'CONSULTATION' ? t('titleConsult') : t('titleLab'))}
          </h2>
        </div>

        {/* Services List - Clean Ink-Efficient Style */}
        <div className="mb-8 space-y-4">
          {sortedItems.map((item, index) => (
            <div key={index} className="relative border-2 border-slate-200 rounded-2xl p-4 overflow-hidden">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 flex items-center justify-center bg-black text-white text-xs font-bold rounded-lg shrink-0">
                      {item.suggestedOrder || index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-black leading-tight uppercase">{item.serviceName}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <span className="text-slate-400">BS:</span> {ticket.doctorName || 'N/A'}
                        </p>
                        <div className="mt-1 py-1 inline-block">
                          <p className="text-sm font-black text-black leading-none">
                            <span className="text-[10px] font-bold mr-1">PHÒNG::</span> {item.roomName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center min-w-[100px] py-2 border-l-2 border-dashed border-slate-200 pl-4 flex flex-col justify-center">
                  <p className="text-5xl font-black text-black leading-none tracking-tighter">
                    {item.queueNumber}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">STT</p>
                </div>
              </div>

              {item.preparationNotes && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-amber-600 font-bold">
                  <span className="text-lg">⚠️</span>
                  <p className="text-[10px] uppercase">{item.preparationNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Patient Info Section */}
        <div className="grid grid-cols-2 gap-y-2 py-4 border-t-2 border-b-2 border-dashed border-slate-200 mb-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fullName')}</p>
            <p className="text-xs font-black text-black uppercase">{ticket.patientName}</p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('code')}</p>
            <p className="text-xs font-mono font-black text-black">{ticket.patientCode}</p>
          </div>
          <div className="space-y-0.5 col-span-2 mt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('printTime')}</p>
            <p className="text-xs font-bold text-black">{format(ticket.date, 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}</p>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="border-2 border-slate-200 rounded-xl p-4 mb-6 bg-slate-50/50">
          <p className="text-[11px] font-bold leading-relaxed text-center">
            <span className="text-black underline">{t('importantNote')}:</span>
            <br />
            {sortedItems.some(i => i.preparationNotes) ? `${t('prepHarmAlert')} ` : ""}
            {t('instruction2')}
          </p>
          <p className="text-[10px] italic text-slate-500 text-center mt-2">{t('greeting')}</p>
        </div>

        {/* Estimates if available */}
        {(ticket.estimatedDuration || ticket.completedBefore) && (
          <div className="flex justify-between items-center mb-6 py-2 px-1 border-b border-dashed border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
            {ticket.estimatedDuration && <span>{t('estimatedDuration')}: {ticket.estimatedDuration} {t('waitUnit')}</span>}
            {ticket.completedBefore && <span>{t('completedBefore')}: ~{ticket.completedBefore}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('thanks')}</p>
          <p className="text-[8px] text-slate-300 mt-2 font-medium">SmartClinic - Powered by ANTIGRAVITY</p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
