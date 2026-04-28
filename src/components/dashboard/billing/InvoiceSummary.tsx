'use client';

import { Card } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import { Invoice } from '@/lib/api/billing/billing';

export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  const t = useTranslations('receptionistBilling.detail');
  const locale = useLocale();

  const totalA = Number(invoice.totalAmount || 0);
  // Calculate paidAmount from payments array to ensure it's always accurate even if root field is lagging
  const paidA = invoice.payments && invoice.payments.length > 0 
    ? invoice.payments.reduce((acc, p) => acc + Number(p.amountPaid || 0), 0)
    : Number(invoice.paidAmount || 0);
  const remainingTotal = totalA - paidA;

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(Number(val));
  };

  return (
    <Card className="rounded-2xl border border-[#1392ec]/20 shadow-sm overflow-hidden bg-blue-50/30">
      <div className="p-5 space-y-4">
        <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 cursor-pointer">{t('summaryTitle')}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{t('totalIncurred')}</span>
            <span className="font-medium text-slate-800">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{t('paidLabel')}</span>
            <span className="font-medium text-emerald-600">{formatCurrency(paidA)}</span>
          </div>
          {/* Visual Progress Bar */}
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden cursor-pointer" title={`${Math.min(100, totalA > 0 ? (paidA / totalA) * 100 : 0).toFixed(0)}% paid`}>
            <div 
              className={`h-full ${remainingTotal <= 0 ? 'bg-emerald-500' : 'bg-[#1392ec]'}`}
              style={{ width: `${Math.min(100, totalA > 0 ? (paidA / totalA) * 100 : 0)}%` }}
            />
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-blue-100 text-base">
            <span className="font-bold text-slate-700">{t('debtLabel')}</span>
            <span className={`font-bold ${remainingTotal > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatCurrency(remainingTotal > 0 ? remainingTotal : 0)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
