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
import { toast } from 'sonner';

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

  const fetchUsers = useCallback(async (filters: UserFilters) => {
    try {
      setLoadingList(true);
      const res = await adminUsersApi.getUsers(filters);
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminUsers.fetchUsers] error:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await adminUsersApi.getStatistics();
      setStats(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminUsers.fetchStats] error:', error);
      toast.error(error.message || 'Failed to fetch user statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const createUser = async (data: AdminCreateUserDto) => {
    try {
      const newUser = await adminUsersApi.createUser(data);
      toast.success('User created successfully');
      return newUser;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create user');
      throw error;
    }
  };

  const suspendUser = async (id: string, data: AdminSuspendUserDto) => {
    try {
      const updatedUser = await adminUsersApi.suspendUser(id, data);
      toast.success(data.isActive ? 'User reinstated successfully' : 'User suspended successfully');
      return updatedUser;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update user status');
      throw error;
    }
  };

  const updateUser = async (id: string, data: AdminUpdateUserDto) => {
    try {
      const updatedUser = await adminUsersApi.updateUser(id, data);
      toast.success('User updated successfully');
      return updatedUser;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update user');
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await adminUsersApi.deleteUser(id);
      toast.success('User deleted successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete user');
      throw error;
    }
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
