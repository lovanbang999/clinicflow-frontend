'use client';

import { useState, useEffect } from 'react';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { EditUserDialog } from '@/components/dashboard/users/EditUserDialog';
import { useAdminUsers } from '@/lib/hooks/useAdminUsers';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { UserRole, User } from '@/types';
import { AdminUserStats } from '@/components/dashboard/users/AdminUserStats';
import { AdminUserFilters } from '@/components/dashboard/users/AdminUserFilters';
import { AdminUserTable } from '@/components/dashboard/users/AdminUserTable';
import { AdminUserPagination } from '@/components/dashboard/users/AdminUserPagination';

type Status = 'Active' | 'Inactive';

export default function AdminUsersPage() {

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
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
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
      search: debouncedSearch || undefined,
      role: selectedRoles.size === 1 ? Array.from(selectedRoles)[0] : undefined,
      isActive:
        selectedStatuses.size === 1
          ? selectedStatuses.has('Active')
          : undefined,
    });
  }, [fetchUsers, page, limit, selectedRoles, selectedStatuses, debouncedSearch]);

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
    setSearch('');
  };

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
    await deleteUser(id);
    fetchUsers({
      page,
      limit,
      role: selectedRoles.size === 1 ? Array.from(selectedRoles)[0] : undefined,
      isActive: selectedStatuses.size === 1 ? selectedStatuses.has('Active') : undefined,
    });
    fetchStats();
  };

  return (
    <div className="p-8 space-y-8">
      {/* Stats */}
      <AdminUserStats stats={stats} loadingStats={loadingStats} />

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
        {loadingList && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <CircleNotchIcon size={32} className="text-[#1392ec] animate-spin" />
          </div>
        )}

        <AdminUserFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedRoles={selectedRoles}
          selectedStatuses={selectedStatuses}
          onToggleRole={toggleRole}
          onToggleStatus={toggleStatus}
          onClearFilters={clearFilters}
          onUserAdded={handleUserAdded}
        />

        <AdminUserTable
          users={users}
          loadingList={loadingList}
          onEdit={(user) => {
            setEditingUser(user);
            setIsEditOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />

        <AdminUserPagination
          page={page}
          limit={limit}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
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
