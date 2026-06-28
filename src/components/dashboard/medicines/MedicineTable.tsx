'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  FunnelIcon,
  PlusIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CircleNotchIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
  EyeIcon,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type AdminMedicine } from '@/lib/api/admin/admin-medicines';

const COLUMNS = [
  'code',
  'medicine',
  'genericName',
  'brandName',
  'dosageForm',
  'price',
  'stock',
  'status',
  'action',
] as const;
const LIMIT = 10;

type FilterActive = 'all' | 'active' | 'inactive';

type Props = {
  medicines: AdminMedicine[];
  isLoading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  totalPages: number;
  total: number;
  filterActive: FilterActive;
  onFilterChange: (f: FilterActive) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onAddMedicine: () => void;
  onEdit: (medicine: AdminMedicine) => void;
  onDelete: (medicine: AdminMedicine) => void;
  onRestore: (medicine: AdminMedicine) => void;
  onViewDetail: (medicine: AdminMedicine) => void;
};

export function MedicineTable({
  medicines,
  isLoading,
  page,
  onPageChange,
  totalPages,
  total,
  filterActive,
  onFilterChange,
  search,
  onSearchChange,
  onAddMedicine,
  onEdit,
  onDelete,
  onRestore,
  onViewDetail,
}: Props) {
  const t = useTranslations('adminMedicines.table');

  const from = total > 0 ? (page - 1) * LIMIT + 1 : 0;
  const to = Math.min(page * LIMIT, total);

  const FILTER_OPTIONS: { value: 'active' | 'inactive'; label: string }[] = [
    { value: 'active', label: t('statusActive') },
    { value: 'inactive', label: t('statusInactive') },
  ];

  const STATUS_STYLES = {
    active: { wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    inactive: { wrapper: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-500' },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden relative min-h-[360px]">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <CircleNotchIcon size={32} className="text-[#1392ec] animate-spin" />
        </div>
      )}

      {/* Toolbar */}
      <div className="p-6 border-b border-[#e5e7eb] flex flex-wrap gap-3 justify-between items-center">
        <h3 className="text-lg font-bold text-[#111518]">{t('title')}</h3>
        <div className="flex flex-1 items-center gap-3 justify-end">
          {/* Search */}
          <div className="relative w-72">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e5e7eb] rounded-xl py-2 pl-9 pr-3 text-sm text-[#111518] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all"
            />
          </div>
          {/* Filter Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all cursor-pointer bg-white',
                  filterActive !== 'all'
                    ? 'border-[#1392ec] text-[#1392ec] bg-[#1392ec]/5 hover:bg-[#1392ec]/10'
                    : 'border-[#e5e7eb] text-[#64748b] hover:bg-gray-50 hover:text-[#111518]',
                )}
              >
                <FunnelIcon size={18} weight={filterActive !== 'all' ? 'fill' : 'regular'} />
                {t('filter')}
                {filterActive !== 'all' && (
                  <span className="size-5 rounded-full bg-[#1392ec] text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
                {t('columns.status')}
              </DropdownMenuLabel>
              {FILTER_OPTIONS.map(({ value, label }) => {
                const styles = STATUS_STYLES[value];
                const isActive = filterActive === value;
                return (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={isActive}
                    onCheckedChange={() => onFilterChange(isActive ? 'all' : value)}
                    className="cursor-pointer"
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                        styles.wrapper,
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', styles.dot)} />
                      {label}
                    </span>
                  </DropdownMenuCheckboxItem>
                );
              })}
              {filterActive !== 'all' && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={() => onFilterChange('all')}
                    className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                  >
                    Clear Status Filter
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add button */}
          <button
            onClick={onAddMedicine}
            className="flex items-center gap-2 px-4 py-2 bg-[#1392ec] text-white rounded-xl text-sm font-bold hover:bg-[#1180d0] transition-all shadow-md shadow-[#1392ec]/20 cursor-pointer"
          >
            <PlusIcon size={16} weight="bold" />
            {t('addMedicine')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className={cn(
                    'px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider',
                    col === 'action' && 'text-right',
                  )}
                >
                  {t(`columns.${col}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {medicines.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#94a3b8] text-sm">
                  {t('empty')}
                </td>
              </tr>
            ) : (
              medicines.map((med) => (
                <tr key={med.id} className="group hover:bg-[#f8fafc] transition-colors">
                  {/* Code */}
                  <td className="px-6 py-4 text-sm font-bold text-[#111518] whitespace-nowrap">
                    {med.code}
                  </td>

                  {/* Medicine Name (Generic + Strength) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-blue-50 text-[#1392ec] flex items-center justify-center shrink-0 border border-blue-100">
                        {med.imageUrl ? (
                          <Image
                            src={med.imageUrl}
                            alt={med.genericName}
                            width={40}
                            height={40}
                            className="rounded-xl object-cover size-full"
                          />
                        ) : (
                          <span className="text-xs font-bold uppercase">
                            {med.genericName.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111518]">
                          {med.genericName}
                        </p>
                        {med.concentration && (
                          <p className="text-xs text-[#64748b] font-medium">
                            {med.concentration}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Generic Name */}
                  <td className="px-6 py-4 text-sm font-medium text-[#111518]">
                    {med.genericName}
                  </td>

                  {/* Brand Name */}
                  <td className="px-6 py-4 text-sm font-medium text-[#64748b]">
                    {med.brandName || '—'}
                  </td>

                  {/* Dosage Form */}
                  <td className="px-6 py-4 text-sm font-medium text-[#64748b] whitespace-nowrap">
                    {med.dosageForm || '—'}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-sm font-bold text-[#111518] whitespace-nowrap">
                    {formatPrice(med.defaultPrice)}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <span
                      className={cn(
                        'font-bold',
                        med.stockQuantity === 0 ? 'text-rose-500' : 'text-[#64748b]',
                      )}
                    >
                      {med.stockQuantity}
                    </span>{' '}
                    <span className="text-xs text-slate-400 font-medium">
                      {med.defaultUnit}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                        med.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200',
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', med.isActive ? 'bg-green-500' : 'bg-gray-400')} />
                      {med.isActive ? t('statusActive') : t('statusInactive')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title={t('actions.view')}
                        onClick={() => onViewDetail(med)}
                        className="p-2 hover:bg-[#1392ec]/10 rounded-lg text-[#64748b] hover:text-[#1392ec] transition-colors cursor-pointer"
                      >
                        <EyeIcon size={18} />
                      </button>
                      <button
                        title={t('actions.edit')}
                        onClick={() => onEdit(med)}
                        className="p-2 hover:bg-[#1392ec]/10 rounded-lg text-[#64748b] hover:text-[#1392ec] transition-colors cursor-pointer"
                      >
                        <PencilSimpleIcon size={18} />
                      </button>
                      {!med.isActive && (
                        <button
                          title={t('actions.restore')}
                          onClick={() => onRestore(med)}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-[#64748b] hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <ArrowCounterClockwiseIcon size={18} />
                        </button>
                      )}
                      {med.isActive && (
                        <button
                          title={t('actions.delete')}
                          onClick={() => onDelete(med)}
                          className="p-2 hover:bg-red-50 rounded-lg text-[#64748b] hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <TrashIcon size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-[#e5e7eb] flex items-center justify-between">
        <span className="text-xs text-[#64748b] font-medium">
          {t('showing')}{' '}
          <span className="text-[#111518] font-bold">{medicines.length > 0 ? `${from}–${to}` : '0'}</span>{' '}
          {t('of')}{' '}
          <span className="text-[#111518] font-bold">{total}</span>{' '}
          {t('medicines')}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#64748b] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CaretLeftIcon size={12} weight="bold" />
            {t('previous')}
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#111518] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('next')}
            <CaretRightIcon size={12} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
