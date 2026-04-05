'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  PencilSimpleIcon,
  ProhibitIcon,
  TrashIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import { User } from '@/types';
import { SuspendUserDialog } from './SuspendUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';

type Status = 'Active' | 'Inactive';
type SortKey = 'fullName' | 'role' | 'createdAt';
type SortDir = 'asc' | 'desc';

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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

interface AdminUserTableProps {
  users: User[];
  loadingList: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (id: string) => void;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <CaretUpDownIcon size={13} className="text-slate-400" />;
  return sortDir === 'asc' ? <CaretUpIcon size={13} className="text-[#1392ec]" weight="bold" /> : <CaretDownIcon size={13} className="text-[#1392ec]" weight="bold" />;
}

export function AdminUserTable({
  users,
  loadingList,
  onEdit,
  onToggleStatus,
  onDelete,
}: AdminUserTableProps) {
  const t = useTranslations('adminUsers');
  const [suspendConfirmUser, setSuspendConfirmUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortKey === 'fullName') { valA = a.fullName.toLowerCase(); valB = b.fullName.toLowerCase(); }
      else if (sortKey === 'role') { valA = a.role; valB = b.role; }
      else if (sortKey === 'createdAt') { valA = a.createdAt; valB = b.createdAt; }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
            {/* Sortable: user (fullName) */}
            <th
              onClick={() => handleSort('fullName')}
              className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider cursor-pointer hover:text-[#1392ec] select-none"
            >
              <span className="flex items-center gap-1.5">
                {t('table.columns.user')}
                <SortIcon col="fullName" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Sortable: role */}
            <th
              onClick={() => handleSort('role')}
              className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider cursor-pointer hover:text-[#1392ec] select-none"
            >
              <span className="flex items-center gap-1.5">
                {t('table.columns.role')}
                <SortIcon col="role" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            {/* Status - not sortable */}
            <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider">
              {t('table.columns.status')}
            </th>
            {/* Sortable: joinedDate */}
            <th
              onClick={() => handleSort('createdAt')}
              className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider cursor-pointer hover:text-[#1392ec] select-none"
            >
              <span className="flex items-center gap-1.5">
                {t('table.columns.joinedDate')}
                <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            <th className="py-4 px-6 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">
              {t('table.columns.action')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {sortedUsers.length === 0 && !loadingList ? (
            <tr>
              <td colSpan={5} className="py-16 text-center text-[#94a3b8] text-sm">
                {t('table.empty')}
              </td>
            </tr>
          ) : (
            sortedUsers.map((u) => {
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
                        onClick={() => onEdit(u)}
                        title={t('table.actions.edit')}
                        className="p-1.5 hover:bg-blue-50 text-[#64748b] hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <PencilSimpleIcon size={18} />
                      </button>
                      <button
                        onClick={() => setSuspendConfirmUser(u)}
                        title={u.isActive ? t('table.actions.suspend') : t('table.actions.reinstate')}
                        className="p-1.5 hover:bg-amber-50 text-[#64748b] hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ProhibitIcon size={18} className={!u.isActive ? 'text-amber-600' : ''} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmUser(u)}
                        title={t('table.actions.delete')}
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

      <SuspendUserDialog
        user={suspendConfirmUser}
        open={!!suspendConfirmUser}
        onOpenChange={(open) => !open && setSuspendConfirmUser(null)}
        onConfirm={(u) => {
          onToggleStatus(u);
          setSuspendConfirmUser(null);
        }}
        loading={loadingList}
      />

      <DeleteUserDialog
        user={deleteConfirmUser}
        open={!!deleteConfirmUser}
        onOpenChange={(open) => !open && setDeleteConfirmUser(null)}
        onConfirm={(id) => {
          onDelete(id);
          setDeleteConfirmUser(null);
        }}
        loading={loadingList}
      />
    </div>
  );
}
