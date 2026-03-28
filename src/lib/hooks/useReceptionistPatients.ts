'use client';

import { useState, useCallback } from 'react';
import { 
  usersApi, 
  PatientFilters, 
  ReceptionistPatientStats,
  RegisterPatientDto,
  CreateGuestPatientDto
} from '@/lib/api/users';
import { User } from '@/types';
import { toast } from 'sonner';

export const useReceptionistPatients = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loadingList, setLoadingList] = useState(false);
  const [stats, setStats] = useState<ReceptionistPatientStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchPatients = useCallback(async (filters: PatientFilters) => {
    try {
      setLoadingList(true);
      const res = await usersApi.getReceptionistPatients(filters);
      setPatients(res.users);
      setPagination(res.pagination);
    } catch (err) {
      console.error('[useReceptionistPatients.fetchPatients] error:', err);
      toast.error('Không thể lấy danh sách bệnh nhân');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await usersApi.getReceptionistPatientsStats();
      setStats(data);
    } catch (err) {
      console.error('[useReceptionistPatients.fetchStats] error:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const updatePatient = async (id: string, data: Partial<User & { 
    bloodType?: string; 
    nationalId?: string; 
    insuranceNumber?: string;
    insuranceProvider?: string;
    insuranceExpiry?: string;
    allergies?: string;
    chronicConditions?: string;
    familyHistory?: string;
  }>) => {
    try {
      const updated = await usersApi.updatePatientProfile(id, data);
      toast.success('Cập nhật thông tin thành công');
      return updated;
    } catch (err) {
      console.error('[useReceptionistPatients.updatePatient] error:', err);
      toast.error('Cập nhật thất bại');
      throw err;
    }
  };

  const registerPatient = async (data: RegisterPatientDto) => {
    try {
      const newUser = await usersApi.registerPatient(data);
      toast.success('Đăng ký bệnh nhân thành công');
      return newUser;
    } catch (err) {
      console.error('[useReceptionistPatients.registerPatient] error:', err);
      toast.error('Đăng ký thất bại');
      throw err;
    }
  };

  const createGuestPatient = async (data: CreateGuestPatientDto) => {
    try {
      const newUser = await usersApi.createGuestPatient(data);
      toast.success('Tạo hồ sơ vãng lai thành công');
      return newUser;
    } catch (err) {
      console.error('[useReceptionistPatients.createGuestPatient] error:', err);
      toast.error('Tạo hồ sơ thất bại');
      throw err;
    }
  };

  return {
    patients,
    pagination,
    loadingList,
    stats,
    loadingStats,
    fetchPatients,
    fetchStats,
    updatePatient,
    registerPatient,
    createGuestPatient,
  };
};
