'use client';

import { useEffect, useState } from 'react';
import { useBilling } from '@/lib/hooks/useBilling';
import { InvoiceStatus } from '@/lib/api/billing';
import { Card } from '@/components/ui/card';
import { ReceiptIcon } from '@phosphor-icons/react';
import { BillingTable } from '@/components/dashboard/billing/BillingTable';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BillingPage() {
  const t = useTranslations('dashboard.receptionist.billingManagement');
  const { invoices, loading, fetchInvoices } = useBilling();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | string>('ALL_STATUS');
  
  useEffect(() => {
    fetchInvoices({ status: statusFilter === 'ALL_STATUS' ? undefined : statusFilter as InvoiceStatus });
  }, [fetchInvoices, statusFilter]);

  return (
    <div className="mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <ReceiptIcon size={28} weight="duotone" className="text-[#1392ec]" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 min-w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InvoiceStatus | '')}
          >
            <SelectTrigger className="w-full h-9 rounded-lg border-slate-200 bg-white cursor-pointer shadow-none focus:ring-[#1392ec]/20">
              <SelectValue placeholder={t('filter.all')} />
            </SelectTrigger>
            <SelectContent position="popper" align="end" className="rounded-xl border-slate-200">
              <SelectItem value="ALL_STATUS" className="cursor-pointer">{t('filter.all')}</SelectItem>
              <SelectItem value={InvoiceStatus.DRAFT} className="cursor-pointer">{t('filter.draft')}</SelectItem>
              <SelectItem value={InvoiceStatus.OPEN} className="cursor-pointer">{t('filter.open')}</SelectItem>
              <SelectItem value={InvoiceStatus.ISSUED} className="cursor-pointer">{t('filter.issued')}</SelectItem>
              <SelectItem value={InvoiceStatus.PAID} className="cursor-pointer">{t('filter.paid')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <BillingTable invoices={invoices} loading={loading} />
      </Card>
    </div>
  );
}
