'use client';

import { WorkspaceQueueItem } from '@/lib/api/billing/billing';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  UserIcon, 
  StethoscopeIcon, 
  ClockIcon,
  CheckCircleIcon,
  CircleIcon,
} from '@phosphor-icons/react';
import { format } from 'date-fns';

import { useTranslations, useLocale } from 'next-intl';

interface BillingQueueItemProps {
  item: WorkspaceQueueItem;
  isSelected: boolean;
  onClick: () => void;
}

export function BillingQueueItem({ item, isSelected, onClick }: BillingQueueItemProps) {
  const t = useTranslations('receptionistBilling');
  const locale = useLocale();
  const isPaid = item.pendingAmount === 0 && item.totalAmount > 0;

  const formatVND = (val: number) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: locale === 'vi' ? 'VND' : 'USD', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-2xl border transition-all cursor-pointer mb-3",
        isSelected 
          ? "bg-white border-[#1392ec] shadow-md ring-1 ring-[#1392ec]/20" 
          : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm"
      )}
    >
      {/* Urgent indicator dot */}
      {item.isUrgent && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar/Icon area */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
          isSelected ? "bg-[#1392ec] text-white" : "bg-white border border-slate-100 text-slate-400 group-hover:text-slate-600"
        )}>
          <UserIcon size={20} weight={isSelected ? "fill" : "regular"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800 truncate pr-4 text-sm leading-tight">
              {item.patientName}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 font-medium">
              {item.bookingCode}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <StethoscopeIcon size={14} />
            <span className="truncate">{t('queueItem.doctorPrefix')} {item.doctorName}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {/* Step Badge */}
            <Badge 
              className={cn(
                "h-5 text-[10px] uppercase font-bold tracking-wider px-2 border-0",
                item.currentStepCode === 'B1' ? "bg-blue-100 text-blue-700" :
                item.currentStepCode === 'B3' ? "bg-amber-100 text-amber-700" :
                "bg-emerald-100 text-emerald-700"
              )}
            >
              {item.currentStepCode}
            </Badge>

            {/* Payment Status */}
            {isPaid ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircleIcon size={12} weight="fill" />
                {t('queueItem.paid')}
              </div>
            ) : item.pendingAmount > 0 ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <ClockIcon size={12} weight="fill" />
                {t('queueItem.awaiting')}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                <CircleIcon size={12} weight="bold" />
                {t('queueItem.notCreated')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">{t('queueItem.pendingAmount')}</span>
          <span className={cn(
            "text-sm font-bold",
            item.pendingAmount > 0 ? "text-[#1392ec]" : "text-slate-400"
          )}>
            {formatVND(item.pendingAmount)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-400 uppercase font-medium tracking-tight">{t('queueItem.createdAt')}</span>
          <span className="text-[11px] font-medium text-slate-600">
            {format(new Date(item.createdAt), 'HH:mm')}
          </span>
        </div>
      </div>
    </div>
  );
}
