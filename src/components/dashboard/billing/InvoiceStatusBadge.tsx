'use client';

import { Badge as UiBadge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/lib/api/billing';
import { useTranslations } from 'next-intl';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const t = useTranslations('receptionistBilling.status');

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return {
          label: t('draft'),
          className: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
        };
      case InvoiceStatus.OPEN:
        return {
          label: t('open'),
          className: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200',
        };
      case InvoiceStatus.ISSUED:
        return {
          label: t('issued'),
          className: 'bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200',
        };
      case InvoiceStatus.PAID:
        return {
          label: t('paid'),
          className: 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200',
        };
      default:
        return {
          label: status,
          className: '',
        };
    }
  };

  const { label, className: statusClass } = getStatusConfig(status);

  return (
    <UiBadge className={`${statusClass} cursor-pointer transition-colors ${className}`}>
      {label}
    </UiBadge>
  );
}
