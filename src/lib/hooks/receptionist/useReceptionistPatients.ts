'use client';

import { useState, useCallback } from 'react';
import { 
  usersApi, 
  PatientFilters, 
  ReceptionistPatientStats,
  RegisterPatientDto,
  CreateGuestPatientDto
} from '@/lib/api/auth/users';
import { User } from '@/types';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export const useReceptionistPatients = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const { execute: executeList, isLoading: loadingList } = useApiHandler();
  const [stats, setStats] = useState<ReceptionistPatientStats | null>(null);
  const { execute: executeStats, isLoading: loadingStats } = useApiHandler();
  const { execute: executeAction } = useApiHandler();

  const fetchPatients = useCallback(async (filters: PatientFilters) => {
    const res = await executeList(
      () => usersApi.getReceptionistPatients(filters),
      { errorFallbackMsg: 'fetchPatientsListError' }
    );
    if (res) {
      setPatients(res.users);
      setPagination(res.pagination);
    }
  }, [executeList]);

  const fetchStats = useCallback(async () => {
    const data = await executeStats(() => usersApi.getReceptionistPatientsStats());
    if (data) setStats(data);
  }, [executeStats]);

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
    return executeAction(
      () => usersApi.updatePatientProfile(id, data),
      {
        onSuccessMsg: 'updatePatientInfoSuccess',
        errorFallbackMsg: 'updateFailedError'
      }
    );
  };

  const registerPatient = async (data: RegisterPatientDto): Promise<(User & { tempPassword?: string }) | undefined> => {
    return executeAction(
      () => usersApi.registerPatient(data),
      {
        onSuccessMsg: 'registerPatientSuccess',
        errorFallbackMsg: 'registrationFailedError'
      }
    );
  };

  const createGuestPatient = async (data: CreateGuestPatientDto) => {
    return executeAction(
      () => usersApi.createGuestPatient(data),
      {
        onSuccessMsg: 'createWalkInPatientSuccess',
        errorFallbackMsg: 'createProfileFailedError'
      }
    );
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
