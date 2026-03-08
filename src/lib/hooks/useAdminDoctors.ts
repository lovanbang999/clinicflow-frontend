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
import { toast } from 'sonner';

export const useAdminDoctors = () => {
  const [doctors, setDoctors] = useState<AdminDoctorsListResponse['users']>([]);
  const [pagination, setPagination] = useState<AdminDoctorsListResponse['pagination']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loadingList, setLoadingList] = useState(false);

  const [stats, setStats] = useState<DoctorStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchDoctors = useCallback(async (filters: DoctorFiltersQuery) => {
    try {
      setLoadingList(true);
      const res = await adminDoctorsApi.getDoctors(filters);
      setDoctors(res.users);
      setPagination(res.pagination);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminDoctors.fetchDoctors] error:', error);
      toast.error(error.message || 'Failed to fetch doctors');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await adminDoctorsApi.getStatistics();
      setStats(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminDoctors.fetchStats] error:', error);
      toast.error(error.message || 'Failed to fetch doctor statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const createDoctor = async (data: AdminCreateDoctorDto): Promise<BackendUser> => {
    try {
      const newDoctor = await adminDoctorsApi.createDoctor(data);
      toast.success('Doctor account created successfully');
      return newDoctor;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create doctor');
      throw error;
    }
  };

  const updateDoctorProfile = async (
    id: string,
    profileData: AdminUpdateDoctorProfileDto,
    userData?: { fullName?: string; email?: string; phone?: string; isActive?: boolean },
  ): Promise<void> => {
    try {
      const tasks: Promise<unknown>[] = [adminDoctorsApi.updateDoctorProfile(id, profileData)];
      if (userData && Object.keys(userData).length > 0) {
        tasks.push(adminDoctorsApi.updateDoctorUser(id, userData));
      }
      await Promise.all(tasks);
      toast.success('Doctor updated successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update doctor');
      throw error;
    }
  };

  const toggleDoctorStatus = async (id: string, isActive: boolean): Promise<void> => {
    try {
      await adminDoctorsApi.toggleStatus(id, { isActive });
      toast.success(isActive ? 'Doctor reinstated successfully' : 'Doctor suspended successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update doctor status');
      throw error;
    }
  };

  const deleteDoctor = async (id: string): Promise<void> => {
    try {
      await adminDoctorsApi.deleteDoctor(id);
      toast.success('Doctor removed successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete doctor');
      throw error;
    }
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
