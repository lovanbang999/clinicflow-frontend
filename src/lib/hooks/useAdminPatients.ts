'use client';

import { useState, useCallback } from 'react';
import { adminPatientsApi } from '@/lib/api/admin-patients';
import {
  PatientRow,
  PatientKpiData,
  PatientSearchQuery,
  AdminCreatePatientDto,
  AdminUpdatePatientDto,
} from '@/types';
import { useApiHandler } from './useApiHandler';

interface PatientPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAdminPatients = () => {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [pagination, setPagination] = useState<PatientPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  
  const { execute, isLoading: loadingList } = useApiHandler();

  const [kpiData, setKpiData] = useState<PatientKpiData | null>(null);
  const { execute: executeKpi, isLoading: loadingKpi } = useApiHandler();

  // Fetch list

  const fetchPatients = useCallback(async (query: PatientSearchQuery) => {
    const res = await execute(
      () => adminPatientsApi.getPatients(query),
      { errorFallbackMsg: 'Failed to fetch patients' }
    );
    if (res) {
      setPatients(res.data);
      setPagination(res.meta);
    }
  }, [execute]);

  // Fetch KPI stats

  const fetchStats = useCallback(async () => {
    const data = await executeKpi(
      () => adminPatientsApi.getStats(),
      { errorFallbackMsg: 'Failed to fetch patient statistics' }
    );
    if (data) {
      setKpiData(data);
    }
  }, [executeKpi]);

  // Mutations

  const createPatient = async (data: AdminCreatePatientDto) => {
    return execute(
      () => adminPatientsApi.createPatient(data),
      {
        onSuccessMsg: 'Patient created successfully',
        errorFallbackMsg: 'Failed to create patient'
      }
    );
  };

  const updatePatient = async (id: string, data: AdminUpdatePatientDto) => {
    return execute(
      () => adminPatientsApi.updatePatient(id, data),
      {
        onSuccessMsg: 'Patient updated successfully',
        errorFallbackMsg: 'Failed to update patient'
      }
    );
  };

  const exportPatients = useCallback(async (query: PatientSearchQuery) => {
    await execute(
      async () => {
        const blob = await adminPatientsApi.exportPatients(query);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `smartclinic_patients_${new Date().toISOString().split('T')[0]}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
      {
        onSuccessMsg: 'Patients exported successfully',
        errorFallbackMsg: 'Failed to export patients'
      }
    );
  }, [execute]);

  return {
    // List
    patients,
    pagination,
    loadingList,
    fetchPatients,
    // KPI
    kpiData,
    loadingKpi,
    fetchStats,
    // Mutations
    createPatient,
    updatePatient,
    exportPatients,
  };
};
