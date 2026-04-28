'use client';

import { 
  HourglassIcon, 
  CheckCircleIcon, 
  CurrencyCircleDollarIcon, 
  FilesIcon 
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkspaceKpis } from '@/lib/api/billing/billing';
import { useTranslations } from 'next-intl';

interface BillingKpiStripProps {
  kpis: WorkspaceKpis | null;
  isLoading: boolean;
}

export function BillingKpiStrip({ kpis, isLoading }: BillingKpiStripProps) {
  const t = useTranslations('receptionistBilling');

  if (isLoading || !kpis) {
    return (
      <div className="flex gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 flex-1 rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: t('kpis.awaiting'),
      value: kpis.awaitingPaymentCount,
      icon: <HourglassIcon size={20} weight="duotone" className="text-amber-500" />,
      unit: t('kpis.unitPatient'),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: t('kpis.completed'),
      value: kpis.completedPaymentCount,
      icon: <CheckCircleIcon size={20} weight="duotone" className="text-emerald-500" />,
      unit: t('kpis.unitPatient'),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: t('kpis.revenue'),
      value: kpis.totalRevenue,
      icon: <CurrencyCircleDollarIcon size={20} weight="duotone" className="text-blue-500" />,
      unit: t('kpis.unitCurrency'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCurrency: true,
    },
    {
      label: t('kpis.invoiceValue'),
      value: kpis.totalInvoicesValue,
      icon: <FilesIcon size={20} weight="duotone" className="text-slate-500" />,
      unit: t('kpis.unitCurrency'),
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      isCurrency: true,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className="flex-1 min-w-[160px] flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className={`p-2 rounded-xl ${item.bgColor} shrink-0`}>
            {item.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {item.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={`text-base font-black ${item.color} tracking-tight`}>
                {item.isCurrency ? item.value.toLocaleString('vi-VN') : item.value}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {item.unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
