'use client';

import { useTranslations } from 'next-intl';
import {
  FunnelIcon,
  XIcon,
  MagnifyingGlassIcon,
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
import { UserRole } from '@/types';

type Status = 'Active' | 'Inactive';

const ALL_ROLES: UserRole[] = ['DOCTOR', 'PATIENT', 'RECEPTIONIST', 'ADMIN'];
const ALL_STATUSES: Status[] = ['Active', 'Inactive'];

const ROLE_STYLES: Record<string, string> = {
  DOCTOR: 'bg-blue-50 text-blue-700 border-blue-100',
  PATIENT: 'bg-purple-50 text-purple-700 border-purple-100',
  RECEPTIONIST: 'bg-amber-50 text-amber-700 border-amber-100',
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

const STATUS_STYLES: Record<Status, { wrapper: string; dot: string }> = {
  Active: {
    wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
  },
  Inactive: {
    wrapper: 'bg-red-50 text-red-700 border-red-100',
    dot: 'bg-red-500',
  },
};

const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

interface AdminUserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedRoles: Set<UserRole>;
  selectedStatuses: Set<Status>;
  onToggleRole: (role: UserRole) => void;
  onToggleStatus: (status: Status) => void;
  onClearFilters: () => void;
  // onUserAdded: () => void;
}

export function AdminUserFilters({
  search,
  onSearchChange,
  selectedRoles,
  selectedStatuses,
  onToggleRole,
  onToggleStatus,
  onClearFilters,
  // onUserAdded,
}: AdminUserFiltersProps) {
  const t = useTranslations('dashboard.admin.userManagement');
  const hasActiveFilters = selectedRoles.size > 0 || selectedStatuses.size > 0;
  const activeFilterCount = selectedRoles.size + selectedStatuses.size;

  return (
    <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center gap-4 flex-wrap">
      <div>
        <h3 className="text-lg font-bold text-[#111518]">{t('table.title')}</h3>
        <p className="text-[#64748b] text-sm font-medium mt-1">
          {t('table.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-56">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            placeholder={t('table.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e5e7eb] rounded-xl py-2 pl-9 pr-3 text-sm text-[#111518] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1392ec]/10 text-[#1392ec] rounded-lg text-xs font-semibold hover:bg-[#1392ec]/20 transition-all cursor-pointer"
          >
            <XIcon size={12} weight="bold" />
            {t('table.clear')} ({activeFilterCount})
          </button>
        )}

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
              {hasActiveFilters && (
                <span className="size-5 rounded-full bg-[#1392ec] text-white text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('table.columns.role')}
            </DropdownMenuLabel>
            {ALL_ROLES.map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={selectedRoles.has(role)}
                onCheckedChange={() => onToggleRole(role)}
                className="cursor-pointer"
              >
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                    ROLE_STYLES[role],
                  )}
                >
                  {t(`table.roles.${toPascalCase(role)}`)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {t('table.columns.status')}
            </DropdownMenuLabel>
            {ALL_STATUSES.map((status) => {
              const s = STATUS_STYLES[status];
              return (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.has(status)}
                  onCheckedChange={() => onToggleStatus(status)}
                  className="cursor-pointer"
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                      s.wrapper,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', s.dot)} />
                    {t(`table.statuses.${status}`)}
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

        {/* <AddUserDialog onUserAdded={onUserAdded} /> */}
      </div>
    </div>
  );
}
