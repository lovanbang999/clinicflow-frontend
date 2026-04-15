'use client';

import { Card } from '@/components/ui/card';
import { WorkspaceKpis } from '@/lib/api/billing/billing';
import { 
  CurrencyCircleDollarIcon, 
  HourglassIcon, 
  CheckCircleIcon, 
  WalletIcon 
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';

interface BillingKpiStripProps {
  kpis: WorkspaceKpis | null;
  isLoading: boolean;
}

function formatVND(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

export function BillingKpiStrip({ kpis, isLoading }: BillingKpiStripProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Đang chờ thanh toán',
      value: kpis.awaitingPaymentCount,
      icon: <HourglassIcon size={24} weight="duotone" className="text-amber-500" />,
      subValue: 'Bệnh nhân',
      color: 'bg-amber-50/50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Đã hoàn tất',
      value: kpis.completedPaymentCount,
      icon: <CheckCircleIcon size={24} weight="duotone" className="text-emerald-500" />,
      subValue: 'Bệnh nhân',
      color: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Doanh thu hôm nay',
      value: formatVND(kpis.totalRevenue),
      icon: <CurrencyCircleDollarIcon size={24} weight="duotone" className="text-blue-500" />,
      subValue: 'VND',
      color: 'bg-blue-50/50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Tổng giá trị hoá đơn',
      value: formatVND(kpis.totalInvoicesValue),
      icon: <WalletIcon size={24} weight="duotone" className="text-slate-500" />,
      subValue: 'VND',
      color: 'bg-slate-50/50',
      borderColor: 'border-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {items.map((item, idx) => (
        <Card key={idx} className={`px-4 py-3 rounded-2xl border ${item.borderColor} ${item.color} shadow-sm transition-all flex items-start gap-4`}>
          <div className="flex-shrink-0 p-2 bg-white rounded-xl border border-white shadow-sm">
            {item.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate mb-0.5">{item.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                {item.value}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.subValue}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
