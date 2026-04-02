'use client';

import { useTranslations } from 'next-intl';
import type { VisitServiceOrder } from '@/lib/api/medical-records';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, ClockIcon, SpinnerIcon, XCircleIcon } from '@phosphor-icons/react';

const STATUS_CONFIG = {
  PENDING:     { labelKey: 'status.pending', icon: ClockIcon,       color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
  IN_PROGRESS: { labelKey: 'status.inProgress', icon: SpinnerIcon,    color: 'border-blue-200 bg-blue-50 text-blue-700' },
  COMPLETED:   { labelKey: 'status.completed', icon: CheckCircleIcon, color: 'border-green-200 bg-green-50 text-green-700' },
  CANCELLED:   { labelKey: 'status.cancelled', icon: XCircleIcon,     color: 'border-gray-200 bg-gray-50 text-gray-500' },
} as const;

interface ServiceOrderCardProps {
  order: VisitServiceOrder;
  onRemove?: (id: string) => void;
  showResult?: boolean;
}

export function ServiceOrderCard({ order, onRemove, showResult = false }: ServiceOrderCardProps) {
  const t = useTranslations('doctorWorkspace.visit.shared');
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;

  return (
    <div className={cn('rounded-xl border p-4 flex flex-col gap-2 transition-all', cfg.color)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            size={18}
            weight="fill"
            className={cn(order.status === 'IN_PROGRESS' && 'animate-spin')}
          />
          <span className="font-semibold text-sm truncate">{order.service.name}</span>
          {order.service.serviceCode && (
            <span className="text-xs opacity-60 font-mono">[{order.service.serviceCode}]</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', cfg.color)}>
            {t(cfg.labelKey)}
          </span>
          {order.status === 'PENDING' && onRemove && (
            <button
              onClick={() => onRemove(order.id)}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              {t('remove')}
            </button>
          )}
        </div>
      </div>

      {showResult && order.status === 'COMPLETED' && (
        <div className="mt-1 pl-7 text-sm space-y-1">
          {order.isAbnormal && (
            <span className="inline-block bg-red-100 text-red-700 border border-red-200 rounded px-2 py-0.5 text-xs font-semibold">
              {t('abnormal')} {order.abnormalNote ? `— ${order.abnormalNote}` : ''}
            </span>
          )}
          {order.resultText ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{order.resultText}</p>
          ) : (
            <p className="text-gray-400 italic text-xs">{t('emptyResult')}</p>
          )}
          {order.resultFileUrl && (
            <a
              href={order.resultFileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              {t('viewFile')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
