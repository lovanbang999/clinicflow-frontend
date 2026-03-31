'use client';

import { useState, useCallback } from 'react';
import { adminUsersApi } from '@/lib/api/admin-users';
import {
  AdminUserStats,
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminSuspendUserDto,
  UserFilters,
  UsersListResponse,
} from '@/types';
import { useApiHandler } from './useApiHandler';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UsersListResponse['users']>([]);
  const [pagination, setPagination] = useState<UsersListResponse['pagination']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loadingList, setLoadingList] = useState(false);
  
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const { execute } = useApiHandler();

  const fetchUsers = useCallback(async (filters: UserFilters) => {
    execute(
      async () => {
        setLoadingList(true);
        const res = await adminUsersApi.getUsers(filters);
        setUsers(res.users);
        setPagination(res.pagination);
      },
      { errorFallbackMsg: 'Failed to fetch users' }
    ).catch(() => {}).finally(() => setLoadingList(false));
  }, [execute]);

  const fetchStats = useCallback(async () => {
    execute(
      async () => {
        setLoadingStats(true);
        const data = await adminUsersApi.getStatistics();
        setStats(data);
      },
      { errorFallbackMsg: 'Failed to fetch user statistics' }
    ).catch(() => {}).finally(() => setLoadingStats(false));
  }, [execute]);

  const createUser = async (data: AdminCreateUserDto) => {
    return execute(
      () => adminUsersApi.createUser(data),
      {
        onSuccessMsg: 'User created successfully',
        errorFallbackMsg: 'Failed to create user'
      }
    );
  };

  const suspendUser = async (id: string, data: AdminSuspendUserDto) => {
    return execute(
      () => adminUsersApi.suspendUser(id, data),
      {
        onSuccessMsg: data.isActive ? 'User reinstated successfully' : 'User suspended successfully',
        errorFallbackMsg: 'Failed to update user status'
      }
    );
  };

  const updateUser = async (id: string, data: AdminUpdateUserDto) => {
    return execute(
      () => adminUsersApi.updateUser(id, data),
      {
        onSuccessMsg: 'User updated successfully',
        errorFallbackMsg: 'Failed to update user'
      }
    );
  };

  const deleteUser = async (id: string) => {
    return execute(
      () => adminUsersApi.deleteUser(id),
      {
        onSuccessMsg: 'User deleted successfully',
        errorFallbackMsg: 'Failed to delete user'
      }
    );
  };

  return {
    users,
    pagination,
    loadingList,
    fetchUsers,
    stats,
    loadingStats,
    fetchStats,
    createUser,
    suspendUser,
    updateUser,
    deleteUser,
  };
};
