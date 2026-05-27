'use client';

import { useTranslations } from 'next-intl';
import { InvoiceType } from '@/lib/api/billing/billing';
import { Activity, FileText } from 'lucide-react';
import { ReceiptIcon } from '@phosphor-icons/react';

export function InvoiceTypeBadge({ type }: { type: InvoiceType }) {
  const t = useTranslations('patientOverview');
  switch (type) {
    case InvoiceType.CONSULTATION:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400">
          <Activity size={12} />
          {t('invoiceTypes.consultation')}
        </span>
      );
    case InvoiceType.SERVICE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400">
          <FileText size={12} />
          {t('invoiceTypes.service')}
        </span>
      );
    case InvoiceType.PHARMACY:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400">
          <ReceiptIcon size={12} />
          {t('invoiceTypes.pharmacy')}
        </span>
      );
    default:
      return <span className="text-xs text-slate-500">{type}</span>;
  }
}
