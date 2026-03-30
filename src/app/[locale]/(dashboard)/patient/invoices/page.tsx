'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { billingApi, Invoice, InvoiceStatus } from '@/lib/api/billing';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import {
  ReceiptIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SealCheckIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations('dashboard.receptionist.billingManagement.status');
  
  switch (status) {
    case InvoiceStatus.PAID:
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 py-1 px-2.5 rounded-full capitalize">
          <CheckCircleIcon weight="fill" />
          {t('paid')}
        </Badge>
      );
    case InvoiceStatus.DRAFT:
    case InvoiceStatus.OPEN:
    case InvoiceStatus.ISSUED:
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 py-1 px-2.5 rounded-full capitalize">
          <ClockIcon weight="fill" />
          {t('open')}
        </Badge>
      );
    case InvoiceStatus.CANCELLED:
      return (
        <Badge className="bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 py-1 px-2.5 rounded-full capitalize">
          <XCircleIcon weight="fill" />
          {t('cancelled')}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PatientInvoicesPage() {
  const t = useTranslations('dashboard.patient');
  const locale = useLocale();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { invoices } = await billingApi.listMyInvoices({ limit: 50 });
        setInvoices(invoices);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const dateLocale = locale === 'vi' ? vi : undefined;
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('invoices')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('invoicesSubtitle')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-12 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center">
            <ReceiptIcon size={40} className="text-slate-300 dark:text-slate-600" weight="duotone" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{t('noInvoices')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[250px]">
              {t('noInvoicesDesc')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr className="border-0">
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                    {t('invoiceNumber')}
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                    {t('date')}
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                    {t('service')}
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-12 text-right">
                    {t('total')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                          <SealCheckIcon size={20} weight="duotone" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          #{inv.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-400 text-sm">
                      <div className="flex items-center gap-2">
                         <CalendarBlankIcon size={14} className="text-slate-400" />
                         {format(new Date(inv.createdAt), 'dd MMMM, yyyy', { locale: dateLocale })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {inv.items?.[0]?.itemName ?? 'Consultation'}
                      </p>
                      {inv.items.length > 1 && (
                        <p className="text-xs text-slate-400 mt-0.5">{t('otherServices', { count: inv.items.length - 1 })}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-5 text-right font-black tabular-nums text-slate-900 dark:text-white">
                      {formatMoney(inv.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {invoices.map((inv) => (
              <div 
                key={inv.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                      <ReceiptIcon size={20} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        #{inv.invoiceNumber}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {inv.items?.[0]?.itemName ?? 'Consultation'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CalendarBlankIcon size={14} />
                    {format(new Date(inv.createdAt), 'dd/MM/yyyy', { locale: dateLocale })}
                  </div>
                  <p className="font-black text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(inv.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
