'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { InvoiceStatusBadge } from '@/components/dashboard/billing/InvoiceStatusBadge';
import { Invoice, InvoiceType } from '@/lib/api/billing/billing';
import { Skeleton } from '@/components/ui/skeleton';
import { EyeIcon, MagnifyingGlassIcon, StethoscopeIcon, TestTubeIcon, PillIcon } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';

interface BillingTableProps {
  invoices: Invoice[];
  loading: boolean;
  basePath?: string;
  tPath?: string;
}

export function BillingTable({ 
  invoices, 
  loading, 
  basePath = '/receptionist/billing',
  tPath = 'receptionistBilling'
}: BillingTableProps) {
  const router = useRouter();
  const tNamespace = tPath as 'receptionistBilling' | 'adminInvoices';
  const t = useTranslations(tNamespace);
  const tTypes = useTranslations(`${tNamespace}.bookingInvoices.types` as 'receptionistBilling.bookingInvoices.types' | 'adminInvoices.bookingInvoices.types');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(val);
  };

  const InvoiceTypeBadge = ({ type }: { type: InvoiceType }) => {
    const config: Record<InvoiceType, { label: string; className: string; icon: React.ReactNode }> = {
      [InvoiceType.CONSULTATION]: {
        label: tTypes('CONSULTATION'),
        className: 'bg-blue-50 text-blue-700 border border-blue-100',
        icon: <StethoscopeIcon size={12} weight="bold" />,
      },
      [InvoiceType.LAB]: {
        label: tTypes('LAB'),
        className: 'bg-violet-50 text-violet-700 border border-violet-100',
        icon: <TestTubeIcon size={12} weight="bold" />,
      },
      [InvoiceType.PHARMACY]: {
        label: tTypes('PHARMACY'),
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        icon: <PillIcon size={12} weight="bold" />,
      },
    };

    const { label, className, icon } = config[type] ?? {
      label: type,
      className: 'bg-slate-50 text-slate-600',
      icon: null,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {icon}
        {label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase">
          <tr>
            <th className="px-6 py-4 font-semibold">{t('table.invoiceNumber')}</th>
            <th className="px-6 py-4 font-semibold">{t('table.patientDoctor')}</th>
            <th className="px-6 py-4 font-semibold">{t('table.type')}</th>
            <th className="px-6 py-4 font-semibold">{t('table.status')}</th>
            <th className="px-6 py-4 font-semibold text-right">{t('table.total')}</th>
            <th className="px-6 py-4 font-semibold text-center">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
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
                  <p className="font-semibold text-slate-800 cursor-pointer hover:underline hover:text-[#1392ec]" onClick={() => router.push(`${basePath}/${inv.id}`)}>{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(inv.createdAt), 'HH:mm - dd/MM', { locale: dateLocale })}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">
                    {inv.booking?.patientProfile?.fullName || t('table.unknown')}
                    {inv.booking?.patientProfile?.patientCode && ` (${inv.booking.patientProfile.patientCode})`}
                  </p>
                  <p className="text-xs text-slate-500">
                    BS: {inv.booking?.doctor?.fullName || t('table.unknown')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <InvoiceTypeBadge type={inv.invoiceType} />
                </td>
                <td className="px-6 py-4">
                  <InvoiceStatusBadge status={inv.status} />
                </td>
                <td className="px-6 py-4 text-right font-medium text-[#1392ec]">
                  {formatCurrency(Number(inv.totalAmount || 0))}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => router.push(`${basePath}/${inv.id}`)}
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
