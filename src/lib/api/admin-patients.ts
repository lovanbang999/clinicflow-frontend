import { AxiosError } from 'axios';
import { apiClient } from './client';
import {
  ApiResponse,
  PatientRow,
  PatientKpiData,
  PatientSearchQuery,
  PatientSearchResponse,
  AdminCreatePatientDto,
  AdminUpdatePatientDto,
} from '@/types';

export const adminPatientsApi = {
  // GET /admin/patients/stats
  getStats: async (): Promise<PatientKpiData> => {
    try {
      const response = await apiClient.get<ApiResponse<PatientKpiData>>(
        '/admin/patients/stats',
      );

      if (!response.data.data) {
        throw new Error('Failed to fetch patient statistics');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // GET /admin/patients?search=&page=&limit=&gender=&status=&bloodType=
  getPatients: async (
    query: PatientSearchQuery,
  ): Promise<PatientSearchResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<PatientSearchResponse>>(
        '/admin/patients',
        { params: query },
      );

      if (!response.data.data) {
        throw new Error('Failed to fetch patients');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // POST /admin/patients
  createPatient: async (data: AdminCreatePatientDto): Promise<PatientRow> => {
    try {
      const response = await apiClient.post<ApiResponse<PatientRow>>(
        '/admin/patients',
        data,
      );

      if (!response.data.data) {
        throw new Error('Failed to create patient');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // GET /admin/patients/:id
  getPatientById: async (id: string): Promise<PatientRow> => {
    try {
      const response = await apiClient.get<ApiResponse<PatientRow>>(
        `/admin/patients/${id}`,
      );

      if (!response.data.data) {
        throw new Error('Failed to fetch patient');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // PATCH /admin/patients/:id
  updatePatient: async (
    id: string,
    data: AdminUpdatePatientDto,
  ): Promise<PatientRow> => {
    try {
      const response = await apiClient.patch<ApiResponse<PatientRow>>(
        `/admin/patients/${id}`,
        data,
      );

      if (!response.data.data) {
        throw new Error('Failed to update patient');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // GET /admin/patients/:id/health-profile
  getPatientHealthProfile: async (id: string): Promise<PatientRow> => {
    try {
      const response = await apiClient.get<ApiResponse<PatientRow>>(
        `/admin/patients/${id}/health-profile`,
      );

      if (!response.data.data) {
        throw new Error('Failed to fetch patient health profile');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};
