'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus, Invoice } from '@/lib/api/billing';
import { Skeleton } from '@/components/ui/skeleton';
import { EyeIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';

interface BillingTableProps {
  invoices: Invoice[];
  loading: boolean;
}

export function BillingTable({ invoices, loading }: BillingTableProps) {
  const router = useRouter();
  const t = useTranslations('dashboard.receptionist.billingManagement');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">{t('status.draft')}</Badge>;
      case InvoiceStatus.OPEN:
        return <Badge className="bg-blue-100 text-blue-600 border-blue-200">{t('status.open')}</Badge>;
      case InvoiceStatus.ISSUED:
        return <Badge className="bg-amber-100 text-amber-600 border-amber-200">{t('status.issued')}</Badge>;
      case InvoiceStatus.PAID:
        return <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200">{t('status.paid')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(val);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">{t('table.invoiceNumber')}</th>
            <th className="px-6 py-4 font-semibold">{t('table.patientDoctor')}</th>
            <th className="px-6 py-4 font-semibold">{t('table.status')}</th>
            <th className="px-6 py-4 font-semibold text-right">{t('table.total')}</th>
            <th className="px-6 py-4 font-semibold text-right">{t('table.paid')}</th>
            <th className="px-6 py-4 font-semibold text-center">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></td>
              </tr>
            ))
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center">
                  <MagnifyingGlassIcon size={32} className="text-slate-300 mb-2" />
                  <p>{t('table.empty')}</p>
                </div>
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(inv.createdAt), 'HH:mm - dd/MM', { locale: dateLocale })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800 cursor-pointer">
                    {inv.booking?.patientProfile?.fullName || t('table.unknown')}
                    {inv.booking?.patientProfile?.patientCode && ` (${inv.booking.patientProfile.patientCode})`}
                  </p>
                  <p className="text-xs text-slate-500">
                    BS: {inv.booking?.doctor?.fullName || t('table.unknown')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(inv.status)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-[#1392ec]">
                  {formatCurrency(Number(inv.totalAmount))}
                </td>
                <td className="px-6 py-4 text-right">
                  {Number(inv.paidAmount) > 0 ? (
                    <span className="text-emerald-600 font-medium cursor-pointer">
                      {formatCurrency(Number(inv.paidAmount))}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => router.push(`/receptionist/billing/${inv.id}`)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-[#1392ec] hover:bg-blue-100 cursor-pointer transition-colors"
                    title={t('table.viewDetails')}
                  >
                    <EyeIcon size={18} weight="bold" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
