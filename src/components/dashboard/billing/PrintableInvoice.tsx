'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Invoice } from '@/lib/api/billing/billing';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export function PrintableInvoice({ invoice }: { invoice: Invoice }) {
  const t = useTranslations('doctorWorkspace.printables.invoice');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wrapping in timeout to avoid lint error about synchronous setState in effect
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: locale === 'vi' ? 'VND' : 'USD',
      maximumFractionDigits: 0 
    }).format(Number(val));
  };

  if (!mounted) return null;

  const content = (
    <div id="printable-invoice" className="hidden print:block w-full bg-white text-black font-sans text-[11pt] leading-normal">
      {/* Universal Print Script - Forces ONLY this component to be visible */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { 
            height: auto !important; 
            overflow: visible !important; 
            margin: 0 !important; 
            padding: 0 !important;
            background: white !important;
          }
          body > * { display: none !important; }
          #printable-invoice { 
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
          #printable-invoice * { visibility: visible !important; }
        }
      `}} />

      {/* Clean Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('clinicName')}</h1>
        <p className="text-[10pt] font-medium text-slate-500 uppercase tracking-widest">{t('clinicSub')}</p>
        <div className="mt-2 text-[9pt] space-y-0.5 text-slate-600">
           <p><span className="font-semibold">Địa chỉ:</span> {t('address')}</p>
           <p><span className="font-semibold">Hotline:</span> {t('contact')} - <span className="font-semibold">Mã số thuế:</span> {t('taxId')}</p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{t('title')}</h2>
          <p className="text-[10pt] text-slate-500 mt-1">Số: <span className="font-mono font-bold text-slate-800">{invoice.invoiceNumber}</span></p>
        </div>
        <div className="text-right text-[9pt] text-slate-400 italic">
          {format(new Date(invoice.createdAt), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-black pb-4">
        <div>
          <p className="font-bold underline">{t('patientInfo')}:</p>
          <p>{t('fullName')}: <span className="font-bold uppercase">{invoice.booking?.patientProfile?.fullName}</span></p>
          <p>ID: {invoice.booking?.patientProfile?.patientCode || 'N/A'}</p>
          <p>Phone: {invoice.booking?.patientProfile?.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="font-bold underline">{t('orderInfo')}:</p>
          <p>{t('doctor')}: {invoice.booking?.doctor?.fullName || 'N/A'}</p>
          <p>{t('status')}: <span className="font-bold uppercase">{invoice.status}</span></p>
          <p>Print: {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
      </div>

      {/* Minimal Table */}
      <table className="w-full mb-6 text-[9pt]">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1 text-left">{t('colService')}</th>
            <th className="py-1 text-center w-12">{t('colQuantity')}</th>
            <th className="py-1 text-right w-24">{t('colPrice')}</th>
            <th className="py-1 text-right w-24">{t('colTotal')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2">{item.itemName}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Simple Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64 space-y-1">
          <div className="flex justify-between">
            <span>{t('totalCost')}:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-black pt-1">
            <span className="uppercase">{t('grandTotal')}:</span>
            <span className="text-lg">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <p className="text-[8pt] italic text-right mt-1">({t('inWords')})</p>
        </div>
      </div>

      {/* Signature Area */}
      <div className="flex justify-between text-center mx-4 gap-4">
        <div className="w-1/3">
          <p className="font-bold">{t('sigPatient')}</p>
          <div className="h-16"></div>
          <p className="text-xs">({t('signed')})</p>
        </div>
        <div className="w-1/3">
          <p className="font-bold">{t('sigCashier')}</p>
          <div className="h-16"></div>
          <p className="text-xs">({t('signed')})</p>
        </div>
        <div className="w-1/3">
          <p className="text-[8pt] italic mb-1">{t('datePlace', { date: format(new Date(), 'dd/MM/yyyy') })}</p>
          <p className="font-bold">{t('clinicConfirm')}</p>
          <div className="h-12 flex items-center justify-center">
            <div className="border border-red-500 rounded px-2 py-1 text-red-500 text-[8pt] font-black uppercase rotate-[-5deg] opacity-50">
              {t('paidStamp').replace('\n', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-[7pt] text-gray-400 border-t border-gray-100 pt-2">
        {t('footerText')} - ID: {invoice.id.substring(0,8).toUpperCase()}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
