'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoneyIcon } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { Invoice } from '@/lib/api/billing/billing';

export function InvoicePaymentHistory({ invoice }: { invoice: Invoice }) {
  const t = useTranslations('receptionistBilling.detail');
  const tModal = useTranslations('receptionistBilling.paymentModal');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const getPaymentMethodLabel = (method: string) => {
    return tModal(`methods.${method as 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET' | 'INSURANCE'}`) || method;
  };

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(Number(val));
  };

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <MoneyIcon size={20} className="text-slate-500" />
        <h2 className="font-semibold text-slate-800">{t('paymentHistoryTitle')}</h2>
      </div>
      <div className="p-0 overflow-x-auto">
        {invoice.payments.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm">
            {t('emptyPayments')}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">{t('paymentTable.time')}</th>
                <th className="px-6 py-3 font-semibold">{t('paymentTable.method')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('paymentTable.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 cursor-pointer">
              {invoice.payments?.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 text-slate-600">
                    {format(new Date(payment.createdAt), 'HH:mm dd/MM/yyyy', { locale: dateLocale })}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant="outline" className="text-slate-600 border-slate-300">
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-emerald-600">
                    +{formatCurrency(payment.amountPaid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
