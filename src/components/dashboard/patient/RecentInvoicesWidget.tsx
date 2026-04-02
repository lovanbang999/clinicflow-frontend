'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { billingApi, Invoice, InvoiceStatus } from '@/lib/api/billing';
import { format } from 'date-fns';
import {
  ReceiptIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function RecentInvoicesWidget() {
  const t = useTranslations('patientOverview');
  const locale = useLocale();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { invoices } = await billingApi.listMyInvoices({ limit: 4 });
        setInvoices(invoices);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: locale === 'vi' ? 'VND' : 'USD',
    }).format(amount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
            <ReceiptIcon size={20} weight="duotone" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-none">{t('recentInvoices')}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{t('billingHistory')}</p>
          </div>
        </div>
        <Link 
          href="/patient/invoices" 
          className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          {t('viewDetail')}
          <CaretRightIcon weight="bold" />
        </Link>
      </div>

      <div className="flex-1 p-2">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
             <ReceiptIcon size={32} className="text-slate-200" weight="duotone" />
             <p className="text-xs font-semibold text-slate-400">{t('noInvoices')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {invoices.map((inv) => (
              <div 
                key={inv.id}
                className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${inv.status === InvoiceStatus.PAID ? 'bg-emerald-500' : 'bg-amber-500'} shadow-lg shadow-current/20`} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">#{inv.invoiceNumber}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5 capitalize">
                       {inv.invoiceType.toLowerCase()} · {format(new Date(inv.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(inv.totalAmount)}
                  </p>
                  <p className={`text-[10px] font-bold mt-0.5 ${inv.status === InvoiceStatus.PAID ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {inv.status === InvoiceStatus.PAID ? t('status.paid') : t('status.pending')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
