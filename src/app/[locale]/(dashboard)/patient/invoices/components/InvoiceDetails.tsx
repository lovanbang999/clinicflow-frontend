'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { InvoiceStatus, type Invoice } from '@/lib/api/billing/billing';
import { Printer, CreditCard } from 'lucide-react';
import { InvoiceTypeBadge } from './InvoiceTypeBadge';

interface InvoiceDetailsProps {
  inv: Invoice;
  onPrint: (inv: Invoice) => void;
}

export function InvoiceDetails({ inv, onPrint }: InvoiceDetailsProps) {
  const t = useTranslations('patientOverview');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : undefined;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const paidAmount = inv.status === InvoiceStatus.PAID
    ? Number(inv.patientCoPayment || 0)
    : (inv.payments && inv.payments.length > 0
        ? inv.payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0)
        : 0);

  return (
    <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-7 space-y-6 animate-in fade-in-50 duration-200">
      {/* Receipt Clinic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-850">
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('receipt.clinicName')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('receipt.clinicAddress')}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('receipt.clinicPhone')}
          </p>
        </div>
        <div className="text-left md:text-right space-y-1 md:self-end">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {t('invoiceNumber')}
          </p>
          <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
            #{inv.invoiceNumber}
          </p>
        </div>
      </div>

      {/* Receipt Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.patientName')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {inv.booking?.patientProfile?.fullName || '-'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.patientCode')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {inv.booking?.patientProfile?.patientCode || '-'}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.doctor')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {inv.booking?.doctor?.fullName || t('unknownDoctor')}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('date')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Item Table */}
      <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80">
            <tr className="border-0">
              <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9">
                {t('receipt.itemName')}
              </th>
              <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9 text-right">
                {t('receipt.price')}
              </th>
              <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9 text-center">
                {t('receipt.qty')}
              </th>
              <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9 text-right">
                {t('receipt.amount')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {inv.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                  {item.itemName}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                  {formatMoney(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatMoney(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost breakdown & actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800">
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrint(inv);
            }}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <Printer size={14} />
            {t('receipt.print')}
          </button>
        </div>

        <div className="w-full sm:w-72 space-y-2 text-xs">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.subtotal')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 tabular-nums">
              {formatMoney(inv.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.insuranceCovered')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 tabular-nums">
              {formatMoney(inv.insuranceAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.coPayment')}</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 tabular-nums">
              {formatMoney(inv.patientCoPayment)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold text-sm">
            <span>{t('receipt.paidAmount')}</span>
            <span className="tabular-nums text-[#1392ec] font-black text-base">
              {formatMoney(paidAmount)}
            </span>
          </div>

          {inv.status === InvoiceStatus.PAID && inv.payments?.[0] && (
            <div className="pt-2 flex flex-col items-end text-right text-[10px] text-slate-400 gap-0.5">
              <div className="flex items-center gap-1 font-semibold">
                <CreditCard size={10} />
                <span>
                  {t('receipt.paymentMethod')}: {t(`receipt.${inv.payments[0].paymentMethod.toLowerCase()}`)}
                </span>
              </div>
              {inv.payments[0].transactionId && (
                <div className="font-mono text-[9px] opacity-80">
                  {t('receipt.transactionId')}: {inv.payments[0].transactionId}
                </div>
              )}
              {inv.paidAt && (
                <div>
                  {t('receipt.paymentDate')}: {format(new Date(inv.paidAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
