'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  UsersIcon,
  UserPlusIcon,
  WifiHighIcon,
  ProhibitIcon,
  FunnelIcon,
  PencilSimpleIcon,
  TrashIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { AddUserDialog } from '@/components/dashboard/AddUserDialog';
import { EditUserDialog } from '@/components/dashboard/EditUserDialog';
import { cn } from '@/lib/utils';
import { useAdminUsers } from '@/lib/hooks/useAdminUsers';
import { UserRole, User } from '@/types';

// Types
type Status = 'Active' | 'Inactive';

const ALL_ROLES: UserRole[] = ['DOCTOR', 'PATIENT', 'RECEPTIONIST', 'ADMIN'];
const ALL_STATUSES: Status[] = ['Active', 'Inactive'];

// Role badge
const ROLE_STYLES: Record<string, string> = {
  DOCTOR: 'bg-blue-50 text-blue-700 border-blue-100',
  PATIENT: 'bg-purple-50 text-purple-700 border-purple-100',
  RECEPTIONIST: 'bg-amber-50 text-amber-700 border-amber-100',
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

// Status badge
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export default function AdminUsersPage() {
  const t = useTranslations('dashboard.admin.userManagement');

  const {
    users,
    pagination,
    loadingList,
    fetchUsers,
    stats,
    loadingStats,
    fetchStats,
    suspendUser,
    deleteUser,
  } = useAdminUsers();

  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Status>>(new Set());
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Load stats once
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Load users whenever filters or page change
  useEffect(() => {
    fetchUsers({
      page,
      limit,
      // Since backend expects a single enum value, we only pass it if exactly one is selected
      role: selectedRoles.size === 1 ? Array.from(selectedRoles)[0] : undefined,
      isActive:
        selectedStatuses.size === 1
          ? selectedStatuses.has('Active')
          : undefined,
    });
  }, [fetchUsers, page, limit, selectedRoles, selectedStatuses]);

  const statCards = [
    {
      label: t('stats.totalUsers'),
      value: loadingStats ? '...' : (stats?.totalUsers || 0).toLocaleString(),
      icon: UsersIcon,
      iconBg: 'bg-blue-50 text-[#1392ec]',
      badge: { text: t('stats.now'), variant: 'neutral' as const },
    },
    {
      label: t('stats.newToday'),
      value: loadingStats ? '...' : '---', // API doesn't provide today specifically, replace if added
      icon: UserPlusIcon,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: { text: t('stats.now'), variant: 'neutral' as const },
    },
    {
      label: t('stats.activeNow'),
      value: loadingStats ? '...' : (stats?.activeUsers || 0).toLocaleString(),
      icon: WifiHighIcon,
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: { text: t('stats.now'), variant: 'neutral' as const },
    },
    {
      label: t('stats.suspended'),
      value: loadingStats ? '...' : (stats?.inactiveUsers || 0).toLocaleString(),
      icon: ProhibitIcon,
      iconBg: 'bg-red-50 text-red-600',
      badge: { text: t('stats.alert'), variant: 'alert' as const },
    },
  ];

  const toggleRole = (role: UserRole) => {
    setPage(1);
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const toggleStatus = (status: Status) => {
    setPage(1);
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const clearFilters = () => {
    setPage(1);
    setSelectedRoles(new Set());
    setSelectedStatuses(new Set());
  };

  const hasActiveFilters = selectedRoles.size > 0 || selectedStatuses.size > 0;
  const activeFilterCount = selectedRoles.size + selectedStatuses.size;

  const handleUserAdded = () => {
    setPage(1);
    fetchUsers({ page: 1, limit });
    fetchStats();
  };

  const handleUserUpdated = () => {
    fetchUsers({
      page,
      limit,
      role: selectedRoles.size === 1 ? Array.from(selectedRoles)[0] : undefined,
      isActive: selectedStatuses.size === 1 ? selectedStatuses.has('Active') : undefined,
    });
    fetchStats();
  };

  const handleToggleStatus = async (user: User) => {
    await suspendUser(user.id, { isActive: !user.isActive });
    fetchUsers({
      page,
      limit,
      role: selectedRoles.size === 1 ? Array.from(selectedRoles)[0] : undefined,
      isActive: selectedStatuses.size === 1 ? selectedStatuses.has('Active') : undefined,
    });
    fetchStats();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      fetchUsers({
        page,
        limit,
        role: selectedRoles.size === 1 ? Array.from(selectedRoles)[0] : undefined,
        isActive: selectedStatuses.size === 1 ? selectedStatuses.has('Active') : undefined,
      });
      fetchStats();
    }
  };

  // Convert DOCTOR -> Doctor mapping
  const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <div className="p-8 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`size-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon size={22} weight="fill" />
                </div>
                {card.badge.variant === 'neutral' && (
                  <span className="text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full text-xs font-bold">
                    {card.badge.text}
                  </span>
                )}
                {card.badge.variant === 'alert' && (
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-bold">
                    {card.badge.text}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[#64748b] text-sm font-medium">{card.label}</p>
                <h3 className="text-2xl font-bold text-[#111518] mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
        {loadingList && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <CircleNotchIcon size={32} className="text-[#1392ec] animate-spin" />
          </div>
        )}

        {/* Table header */}
        <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-[#111518]">{t('table.title')}</h3>
            <p className="text-[#64748b] text-sm font-medium mt-1">
              {t('table.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
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
                    onCheckedChange={() => toggleRole(role)}
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
                      onCheckedChange={() => toggleStatus(status)}
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
                      onClick={clearFilters}
                      className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                    >
                      {t('table.clearAll')}
                    </button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AddUserDialog onUserAdded={handleUserAdded} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                {['user', 'role', 'status', 'joinedDate', 'action'].map((colKey) => (
                  <th
                    key={colKey}
                    className={`py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider ${colKey === 'action' ? 'text-right' : ''}`}
                  >
                    {t(`table.columns.${colKey as 'user' | 'role' | 'status' | 'joinedDate' | 'action'}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {users.length === 0 && !loadingList ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#94a3b8] text-sm">
                    {t('table.empty')}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const derivedStatus = u.isActive ? 'Active' : 'Inactive';
                  const statusStyle = STATUS_STYLES[derivedStatus];
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* User */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {u.avatar ? (
                            <div
                              className="size-10 rounded-full bg-cover bg-center border border-[#e5e7eb] shrink-0"
                              style={{ backgroundImage: `url("${u.avatar}")` }}
                            />
                          ) : (
                            <div
                              className="size-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 bg-blue-100 text-blue-600 border-blue-200"
                            >
                              {getInitials(u.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-[#111518]">{u.fullName}</p>
                            <p className="text-xs text-[#64748b]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_STYLES[u.role]}`}
                        >
                          {t(`table.roles.${toPascalCase(u.role)}`)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.wrapper}`}
                        >
                          <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                          {t(`table.statuses.${derivedStatus}`)}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-[#64748b]">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsEditOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 hover:bg-blue-50 text-[#64748b] hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <PencilSimpleIcon size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Suspend' : 'Reinstate'}
                            className="p-1.5 hover:bg-amber-50 text-[#64748b] hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <ProhibitIcon size={18} className={!u.isActive ? 'text-amber-600' : ''} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            title="Delete"
                            className="p-1.5 hover:bg-red-50 text-[#64748b] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
          <p className="text-xs text-[#64748b] font-medium">
            {t('table.showing')}{' '}
            <span className="text-[#111518] font-bold">
              {users.length > 0 ? `${(page - 1) * limit + 1}-${(page - 1) * limit + users.length}` : '0'}
            </span>{' '}
            {t('table.of')}{' '}
            <span className="text-[#111518] font-bold">
              {pagination.total}
            </span>{' '}
            {t('table.users')}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#64748b] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CaretLeftIcon size={12} weight="bold" />
              {t('table.previous')}
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#111518] hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('table.next')}
              <CaretRightIcon size={12} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <EditUserDialog 
        user={editingUser}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
