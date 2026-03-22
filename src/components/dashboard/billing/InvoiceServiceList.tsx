'use client';

import { Card } from '@/components/ui/card';
import { ReceiptIcon, SyringeIcon, StethoscopeIcon } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';
import { Invoice } from '@/lib/api/billing';

export function InvoiceServiceList({ invoice }: { invoice: Invoice }) {
  const t = useTranslations('dashboard.receptionist.billingManagement.detail');
  const locale = useLocale();

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(Number(val));
  };

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <ReceiptIcon size={20} className="text-slate-500" />
        <h2 className="font-semibold text-slate-800">{t('itemsTitle')}</h2>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">{t('tables.serviceName')}</th>
              <th className="px-6 py-3 font-semibold text-center">{t('tables.qty')}</th>
              <th className="px-6 py-3 font-semibold text-right">{t('tables.price')}</th>
              <th className="px-6 py-3 font-semibold text-right">{t('tables.total')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.isLab ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.isLab ? <SyringeIcon size={16} /> : <StethoscopeIcon size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      {item.isLab && (
                        <p className="text-[10px] text-amber-600 font-medium">{t('labLabel')}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-800">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <td colSpan={3} className="px-6 py-4 text-right font-semibold text-slate-600">{t('totalLabel')}</td>
              <td className="px-6 py-4 text-right font-bold text-[#1392ec] text-base cursor-pointer">
                {formatCurrency(invoice.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
