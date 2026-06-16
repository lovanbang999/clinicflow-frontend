'use client';

import { useTranslations } from 'next-intl';
import { FunnelIcon, UserPlusIcon, XIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  ALL_SPECIALTIES,
  ALL_STATUSES,
  SPECIALTY_STYLES,
  STATUS_STYLES,
  type DoctorStatus,
  type Specialty,
} from './types';

type Props = {
  selectedSpecialties: Set<Specialty>;
  selectedStatuses: Set<DoctorStatus>;
  onToggleSpecialty: (sp: Specialty) => void;
  onToggleStatus: (st: DoctorStatus) => void;
  onClearFilters: () => void;
  onAddDoctor: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
};

export function DoctorTableToolbar({
  selectedSpecialties,
  selectedStatuses,
  onToggleSpecialty,
  onToggleStatus,
  onClearFilters,
  onAddDoctor,
  searchValue = '',
  onSearchChange,
}: Props) {
  const t = useTranslations('adminDoctors');

  const activeFilterCount = selectedSpecialties.size + selectedStatuses.size;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="px-6 py-5 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-[#111518]">{t('table.title')}</h3>
        <p className="text-[#64748b] text-sm font-medium mt-0.5">{t('table.subtitle')}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search by name */}
        <div className="relative">
          <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={t('table.searchPlaceholder')}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all w-52"
          />
        </div>
        {/* Clear chip */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1392ec]/10 text-[#1392ec] rounded-lg text-xs font-semibold hover:bg-[#1392ec]/20 transition-all cursor-pointer"
          >
            <XIcon size={12} weight="bold" />
            {t('table.clear')} ({activeFilterCount})
          </button>
        )}

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all cursor-pointer',
                hasActiveFilters
                  ? 'border-[#1392ec] text-[#1392ec] bg-[#1392ec]/5 hover:bg-[#1392ec]/10'
                  : 'border-[#e5e7eb] text-[#64748b] hover:bg-gray-50 hover:text-[#111518]',
              )}
            >
              <FunnelIcon size={18} weight={hasActiveFilters ? 'fill' : 'regular'} />
              {t('table.filter')}
              {activeFilterCount > 0 && (
                <span className="size-5 rounded-full bg-[#1392ec] text-white text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* Specialty section */}
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('table.columns.specialty')}
            </DropdownMenuLabel>
            {ALL_SPECIALTIES.map((sp) => (
              <DropdownMenuCheckboxItem
                key={sp}
                checked={selectedSpecialties.has(sp)}
                onCheckedChange={() => onToggleSpecialty(sp)}
                className="cursor-pointer"
              >
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                    SPECIALTY_STYLES[sp] ?? 'bg-gray-100 text-gray-700 border-gray-200',
                  )}
                >
                  {t(`specialties.${sp}`)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            {/* Status section */}
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('table.columns.status')}
            </DropdownMenuLabel>
            {ALL_STATUSES.map((st) => {
              const styles = STATUS_STYLES[st];
              return (
                <DropdownMenuCheckboxItem
                  key={st}
                  checked={selectedStatuses.has(st)}
                  onCheckedChange={() => onToggleStatus(st)}
                  className="cursor-pointer"
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                      styles.wrapper,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', styles.dot)} />
                    {t(`table.statuses.${st}`)}
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={onClearFilters}
                  className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                >
                  {t('table.clearAll')}
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Doctor */}
        <button
          onClick={onAddDoctor}
          className="flex items-center gap-2 px-4 py-2 bg-[#1392ec] text-white rounded-xl text-sm font-semibold hover:bg-[#1180d0] transition-all shadow-sm shadow-[#1392ec]/20 cursor-pointer"
        >
          <UserPlusIcon size={18} weight="bold" />
          {t('table.addDoctor')}
        </button>
      </div>
    </div>
  );
}
