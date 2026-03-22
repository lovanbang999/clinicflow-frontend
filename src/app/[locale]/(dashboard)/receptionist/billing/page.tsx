'use client';

import { useEffect, useState } from 'react';
import { useBilling } from '@/lib/hooks/useBilling';
import { InvoiceStatus } from '@/lib/api/billing';
import { Card } from '@/components/ui/card';
import { ReceiptIcon } from '@phosphor-icons/react';
import { BillingTable } from '@/components/dashboard/billing/BillingTable';
import { useTranslations } from 'next-intl';

export default function BillingPage() {
  const t = useTranslations('dashboard.receptionist.billingManagement');
  const { invoices, loading, fetchInvoices } = useBilling();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  
  useEffect(() => {
    fetchInvoices({ status: statusFilter || undefined });
  }, [fetchInvoices, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <ReceiptIcon size={28} weight="duotone" className="text-[#1392ec]" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
            className="h-9 px-3 text-sm rounded-lg border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 cursor-pointer"
          >
            <option value="">{t('filter.all')}</option>
            <option value={InvoiceStatus.DRAFT}>{t('filter.draft')}</option>
            <option value={InvoiceStatus.OPEN}>{t('filter.open')}</option>
            <option value={InvoiceStatus.ISSUED}>{t('filter.issued')}</option>
            <option value={InvoiceStatus.PAID}>{t('filter.paid')}</option>
          </select>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <BillingTable invoices={invoices} loading={loading} />
      </Card>
    </div>
  );
}
