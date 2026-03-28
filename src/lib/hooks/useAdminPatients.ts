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
import { toast } from 'sonner';

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
  const [loadingList, setLoadingList] = useState(false);

  const [kpiData, setKpiData] = useState<PatientKpiData | null>(null);
  const [loadingKpi, setLoadingKpi] = useState(false);

  // Fetch list

  const fetchPatients = useCallback(async (query: PatientSearchQuery) => {
    try {
      setLoadingList(true);
      const res = await adminPatientsApi.getPatients(query);
      setPatients(res.data);
      setPagination(res.meta);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminPatients.fetchPatients] error:', error);
      toast.error(error.message || 'Failed to fetch patients');
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Fetch KPI stats

  const fetchStats = useCallback(async () => {
    try {
      setLoadingKpi(true);
      const data = await adminPatientsApi.getStats();
      setKpiData(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminPatients.fetchStats] error:', error);
      toast.error(error.message || 'Failed to fetch patient statistics');
    } finally {
      setLoadingKpi(false);
    }
  }, []);

  // Mutations

  const createPatient = async (data: AdminCreatePatientDto) => {
    try {
      const newPatient = await adminPatientsApi.createPatient(data);
      toast.success('Patient created successfully');
      return newPatient;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create patient');
      throw error;
    }
  };

  const updatePatient = async (id: string, data: AdminUpdatePatientDto) => {
    try {
      const updated = await adminPatientsApi.updatePatient(id, data);
      toast.success('Patient updated successfully');
      return updated;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update patient');
      throw error;
    }
  };

  const exportPatients = useCallback(async (query: PatientSearchQuery) => {
    try {
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
      toast.success('Patients exported successfully');
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminPatients.exportPatients] error:', error);
      toast.error(error.message || 'Failed to export patients');
    }
  }, []);

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
