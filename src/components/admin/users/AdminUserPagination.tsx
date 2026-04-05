'use client';

import { useTranslations } from 'next-intl';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

interface PaginationProps {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminUserPagination({
  page,
  limit,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations('adminUsers');
  
  // Calculate displayed range
  const startParam = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  // Account for the last page where items might be less than limit
  const currentTotalOnPage = Math.min(page * limit, totalItems);
  const endParam = totalItems > 0 ? currentTotalOnPage : 0;

  return (
    <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
      <p className="text-xs text-[#64748b] font-medium">
        {t('table.showing')}{' '}
        <span className="text-[#111518] font-bold">
          {startParam === 0 ? '0' : `${startParam}-${endParam}`}
        </span>{' '}
        {t('table.of')}{' '}
        <span className="text-[#111518] font-bold">{totalItems}</span>{' '}
        {t('table.users')}
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#64748b] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <CaretLeftIcon size={12} weight="bold" />
          {t('table.previous')}
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#111518] hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('table.next')}
          <CaretRightIcon size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}
