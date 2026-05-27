'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/lib/api/billing/billing';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@phosphor-icons/react';

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations('receptionistBilling.status');

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
