'use client';

import { useTranslations } from 'next-intl';
import { InvoiceType } from '@/lib/api/billing/billing';
import { Activity, FileText } from 'lucide-react';
import { ReceiptIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

export function PatientInvoiceTypeBadge({ type }: { type: InvoiceType }) {
  const t = useTranslations('patientOverview');
  switch (type) {
    case InvoiceType.CONSULTATION:
      return (
        <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20 flex items-center gap-1.5 py-0.5 px-2.5 rounded-lg capitalize">
          <Activity size={12} />
          {t('invoiceTypes.consultation')}
        </Badge>
      );
    case InvoiceType.SERVICE:
      return (
        <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20 flex items-center gap-1.5 py-0.5 px-2.5 rounded-lg capitalize">
          <FileText size={12} />
          {t('invoiceTypes.service')}
        </Badge>
      );
    case InvoiceType.PHARMACY:
      return (
        <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20 flex items-center gap-1.5 py-0.5 px-2.5 rounded-lg capitalize">
          <ReceiptIcon size={12} />
          {t('invoiceTypes.pharmacy')}
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}
