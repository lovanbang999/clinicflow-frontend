'use client';

import { useTranslations } from 'next-intl';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  DownloadSimpleIcon,
  XIcon,
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
import {
  ALL_GENDERS,
  ALL_STATUSES,
  ALL_BLOOD_TYPES,
  GENDER_STYLES,
  STATUS_STYLES,
  BLOOD_TYPE_STYLES,
  type PatientGender,
  type PatientStatus,
  type BloodType,
} from './types';

type PatientFiltersProps = {
  search: string;
  onSearchChange: (val: string) => void;
  selectedGenders: Set<PatientGender>;
  selectedStatuses: Set<PatientStatus>;
  selectedBloodTypes: Set<BloodType>;
  onToggleGender: (g: PatientGender) => void;
  onToggleStatus: (s: PatientStatus) => void;
  onToggleBloodType: (bt: BloodType) => void;
  onClearFilters: () => void;
  onAddPatient?: () => void;
  onExport?: () => void;
};

export function PatientFilters({
  search,
  onSearchChange,
  selectedGenders,
  selectedStatuses,
  selectedBloodTypes,
  onToggleGender,
  onToggleStatus,
  onToggleBloodType,
  onClearFilters,
  onAddPatient,
  onExport,
}: PatientFiltersProps) {
  const t = useTranslations('dashboard.admin');

  const activeFilterCount =
    selectedGenders.size + selectedStatuses.size + selectedBloodTypes.size;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="px-6 py-4 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Table title */}
      <h3 className="font-bold text-[#111518] text-base shrink-0">
        {t('patientManagement.table.title')}
      </h3>

      {/* Right side: search + action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('patientManagement.table.searchPlaceholder')}
            className="pl-9 pr-4 py-2 bg-[#f6f7f8] border border-[#e5e7eb] rounded-xl text-sm text-[#111518] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 focus:border-[#1392ec] w-64 transition-all"
          />
        </div>

        {/* Clear chip — appears when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1392ec]/10 text-[#1392ec] rounded-lg text-xs font-semibold hover:bg-[#1392ec]/20 transition-all cursor-pointer"
          >
            <XIcon size={12} weight="bold" />
            {t('patientManagement.table.clear')} ({activeFilterCount})
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
                  : 'border-[#e5e7eb] text-[#64748b] hover:bg-[#f6f7f8] hover:text-[#111518]',
              )}
            >
              <FunnelIcon size={16} weight={hasActiveFilters ? 'fill' : 'regular'} />
              {t('patientManagement.table.filter')}
              {activeFilterCount > 0 && (
                <span className="size-5 rounded-full bg-[#1392ec] text-white text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {/* Gender */}
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('patientManagement.table.columns.gender')}
            </DropdownMenuLabel>
            {ALL_GENDERS.map((g) => (
              <DropdownMenuCheckboxItem
                key={g}
                checked={selectedGenders.has(g)}
                onCheckedChange={() => onToggleGender(g)}
                className="cursor-pointer"
              >
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                    GENDER_STYLES[g],
                  )}
                >
                  {t(`patientManagement.table.genders.${g}`)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            {/* Status */}
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('patientManagement.table.columns.status')}
            </DropdownMenuLabel>
            {ALL_STATUSES.map((s) => {
              const styles = STATUS_STYLES[s];
              return (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={selectedStatuses.has(s)}
                  onCheckedChange={() => onToggleStatus(s)}
                  className="cursor-pointer"
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                      styles.wrapper,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', styles.dot)} />
                    {t(`patientManagement.table.statuses.${s}`)}
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}

            <DropdownMenuSeparator />

            {/* Blood Type */}
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('patientManagement.table.columns.blood')}
            </DropdownMenuLabel>
            {ALL_BLOOD_TYPES.map((bt) => (
              <DropdownMenuCheckboxItem
                key={bt}
                checked={selectedBloodTypes.has(bt)}
                onCheckedChange={() => onToggleBloodType(bt)}
                className="cursor-pointer"
              >
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                    BLOOD_TYPE_STYLES[bt],
                  )}
                >
                  {bt}
                </span>
              </DropdownMenuCheckboxItem>
            ))}

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={onClearFilters}
                  className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                >
                  {t('patientManagement.table.clearAll')}
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Patient */}
        <button
          onClick={onAddPatient}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1392ec] hover:bg-[#1180d0] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-[#1392ec]/20 cursor-pointer"
        >
          <PlusIcon size={16} weight="bold" />
          {t('patientManagement.table.addPatient')}
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748b] border border-[#e5e7eb] rounded-xl hover:bg-[#f6f7f8] transition-colors cursor-pointer"
        >
          <DownloadSimpleIcon size={16} />
          {t('patientManagement.table.export')}
        </button>
      </div>
    </div>
  );
}
