'use client';

import { useTranslations } from 'next-intl';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

type PatientPaginationProps = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PatientPagination({
  page,
  limit,
  totalItems,
  totalPages,
  onPageChange,
}: PatientPaginationProps) {
  const t = useTranslations('receptionistPatients.table.pagination');

  const from = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalItems);

  return (
    <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
      <p className="text-xs text-[#64748b] font-medium">
        {t.rich('showing', {
          range: (children) => <span className="text-[#111518] font-bold">{children}</span>,
          total: (children) => <span className="text-[#111518] font-bold">{children}</span>,
          valRange: totalItems === 0 ? '0' : `${from}-${to}`,
          valTotal: new Intl.NumberFormat('en-US').format(totalItems)
        })}
      </p>

      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#64748b] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <CaretLeftIcon size={12} weight="bold" />
          {t('prev')}
        </button>
        <button
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#111518] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {t('next')}
          <CaretRightIcon size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}
