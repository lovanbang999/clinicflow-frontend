'use client';

import { useTranslations } from 'next-intl';
import {
  PencilSimpleIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { type Service, iconColor, formatPrice } from './types';

type Props = {
  service: Service;
  index: number;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onRestore: (service: Service) => void;
};

export function ServiceTableRow({ service, index, onEdit, onDelete, onRestore }: Props) {
  const t = useTranslations('dashboard.serviceManagement.table');

  return (
    <tr className="group hover:bg-[#f8fafc] transition-colors">
      {/* Service name + desc */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', iconColor(index))}>
            <StethoscopeIcon size={20} weight="fill" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111518]">{service.name}</p>
            {service.description && (
              <p className="text-xs text-[#64748b] font-medium truncate max-w-[200px]">
                {service.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4 text-sm font-bold text-[#111518] whitespace-nowrap">
        {formatPrice(service.price)}
      </td>

      {/* Duration */}
      <td className="px-6 py-4 text-sm font-medium text-[#64748b] whitespace-nowrap">
        {t('durationMins', { count: service.durationMinutes })}
      </td>

      {/* Max slots */}
      <td className="px-6 py-4 text-sm font-medium text-[#64748b] whitespace-nowrap">
        {service.maxSlotsPerHour}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
            service.isActive
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-100 text-gray-600 border-gray-200',
          )}
        >
          <span className={cn('size-1.5 rounded-full', service.isActive ? 'bg-green-500' : 'bg-gray-400')} />
          {service.isActive ? t('statusActive') : t('statusInactive')}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title={t('actions.edit')}
            onClick={() => onEdit(service)}
            className="p-2 hover:bg-[#1392ec]/10 rounded-lg text-[#64748b] hover:text-[#1392ec] transition-colors cursor-pointer"
          >
            <PencilSimpleIcon size={18} />
          </button>
          {!service.isActive && (
            <button
              title={t('actions.restore')}
              onClick={() => onRestore(service)}
              className="p-2 hover:bg-emerald-50 rounded-lg text-[#64748b] hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ArrowCounterClockwiseIcon size={18} />
            </button>
          )}
          <button
            title={t('actions.delete')}
            onClick={() => onDelete(service)}
            className="p-2 hover:bg-red-50 rounded-lg text-[#64748b] hover:text-red-500 transition-colors cursor-pointer"
          >
            <TrashIcon size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
