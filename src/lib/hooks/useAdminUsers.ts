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
      { errorFallbackMsg: 'fetchUsersError' }
    ).catch(() => {}).finally(() => setLoadingList(false));
  }, [execute]);

  const fetchStats = useCallback(async () => {
    execute(
      async () => {
        setLoadingStats(true);
        const data = await adminUsersApi.getStatistics();
        setStats(data);
      },
      { errorFallbackMsg: 'fetchUserStatsError' }
    ).catch(() => {}).finally(() => setLoadingStats(false));
  }, [execute]);

  const createUser = async (data: AdminCreateUserDto) => {
    return execute(
      () => adminUsersApi.createUser(data),
      {
        onSuccessMsg: 'createUserSuccess',
        errorFallbackMsg: 'createUserError'
      }
    );
  };

  const suspendUser = async (id: string, data: AdminSuspendUserDto) => {
    return execute(
      () => adminUsersApi.suspendUser(id, data),
      {
        onSuccessMsg: data.isActive ? 'User reinstated successfully' : 'User suspended successfully',
        errorFallbackMsg: 'updateUserStatusError'
      }
    );
  };

  const updateUser = async (id: string, data: AdminUpdateUserDto) => {
    return execute(
      () => adminUsersApi.updateUser(id, data),
      {
        onSuccessMsg: 'updateUserSuccess',
        errorFallbackMsg: 'updateUserError'
      }
    );
  };

  const deleteUser = async (id: string) => {
    return execute(
      () => adminUsersApi.deleteUser(id),
      {
        onSuccessMsg: 'deleteUserSuccess',
        errorFallbackMsg: 'deleteUserError'
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
