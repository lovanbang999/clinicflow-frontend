'use client';

import { useState, useCallback } from 'react';
import {
  adminDoctorsApi,
  type AdminCreateDoctorDto,
  type AdminUpdateDoctorProfileDto,
  type DoctorFiltersQuery,
  type DoctorStatsResponse,
  type AdminDoctorsListResponse,
} from '@/lib/api/admin-doctors';
import { BackendUser } from '@/types';
import { useApiHandler } from './useApiHandler';

export const useAdminDoctors = () => {
  const [doctors, setDoctors] = useState<AdminDoctorsListResponse['users']>([]);
  const [pagination, setPagination] = useState<AdminDoctorsListResponse['pagination']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  
  const { execute, isLoading: loadingList } = useApiHandler();
  
  const [stats, setStats] = useState<DoctorStatsResponse | null>(null);
  const { execute: executeStats, isLoading: loadingStats } = useApiHandler();

  const fetchDoctors = useCallback(async (filters: DoctorFiltersQuery) => {
    const res = await execute(
      () => adminDoctorsApi.getDoctors(filters),
      { errorFallbackMsg: 'fetchDoctorsError' }
    );
    if (res) {
      setDoctors(res.users);
      setPagination(res.pagination);
    }
  }, [execute]);

  const fetchStats = useCallback(async () => {
    const data = await executeStats(
      () => adminDoctorsApi.getStatistics(),
      { errorFallbackMsg: 'fetchDoctorStatsError' }
    );
    if (data) {
      setStats(data);
    }
  }, [executeStats]);

  const createDoctor = async (data: AdminCreateDoctorDto): Promise<BackendUser | undefined> => {
    return execute(
      () => adminDoctorsApi.createDoctor(data),
      {
        onSuccessMsg: 'createDoctorSuccess',
        errorFallbackMsg: 'createDoctorError'
      }
    );
  };

  const updateDoctorProfile = async (
    id: string,
    profileData: AdminUpdateDoctorProfileDto,
    userData?: { fullName?: string; email?: string; phone?: string; isActive?: boolean },
  ): Promise<void> => {
    await execute(
      async () => {
        const tasks: Promise<unknown>[] = [adminDoctorsApi.updateDoctorProfile(id, profileData)];
        if (userData && Object.keys(userData).length > 0) {
          tasks.push(adminDoctorsApi.updateDoctorUser(id, userData));
        }
        await Promise.all(tasks);
      },
      {
        onSuccessMsg: 'updateDoctorSuccess',
        errorFallbackMsg: 'updateDoctorError'
      }
    );
  };

  const toggleDoctorStatus = async (id: string, isActive: boolean): Promise<void> => {
    await execute(
      () => adminDoctorsApi.toggleStatus(id, { isActive }),
      {
        onSuccessMsg: isActive ? 'Doctor reinstated successfully' : 'Doctor suspended successfully',
        errorFallbackMsg: 'updateDoctorStatusError'
      }
    );
  };

  const deleteDoctor = async (id: string): Promise<void> => {
    await execute(
      () => adminDoctorsApi.deleteDoctor(id),
      {
        onSuccessMsg: 'deleteDoctorSuccess',
        errorFallbackMsg: 'deleteDoctorError'
      }
    );
  };

  return {
    doctors,
    pagination,
    loadingList,
    fetchDoctors,
    stats,
    loadingStats,
    fetchStats,
    createDoctor,
    updateDoctorProfile,
    toggleDoctorStatus,
    deleteDoctor,
  };
};
