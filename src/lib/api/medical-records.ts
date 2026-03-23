import { apiClient } from './client';

export interface MedicalRecordRef {
  id: string;
  diagnosisName?: string;
  treatmentPlan?: string;
}

export interface PrescriptionRef {
  id: string;
  items: Array<{ medicineName: string }>;
}

export interface VisitHistoryItem {
  bookingId: string;
  bookingDate: string;
  doctorName: string;
  serviceName: string;
  medicalRecord?: MedicalRecordRef;
  prescription?: PrescriptionRef;
}

export interface PatientMedicalProfile {
  id: string;
  patientCode?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  allergies?: string;
  chronicConditions?: string;
  familyHistory?: string;
  occupation?: string;
  ethnicity?: string;
}

export interface PatientHistoryResponse {
  patientProfile: PatientMedicalProfile;
  recentVisits: VisitHistoryItem[];
}

export interface PrescriptionItemDto {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  quantity: number;
  unit: string;
  instructions?: string;
}

export interface CreateMedicalRecordDto {
  bookingId: string;
  chiefComplaint?: string;
  clinicalFindings?: string;
  diagnosisCode?: string;
  diagnosisName?: string;
  treatmentPlan?: string;
  doctorNotes?: string;
  followUpDate?: string;
  followUpNote?: string;
  isFinalized?: boolean;
  completeVisit?: boolean;
  prescriptionItems?: PrescriptionItemDto[];
}

export interface ICD10Record {
  code: string;
  name: string;
}

export const medicalRecordsApi = {
  getPatientHistory: async (patientProfileId: string): Promise<PatientHistoryResponse> => {
    const response = await apiClient.get(`medical-records/patient/${patientProfileId}/history`);
    return response.data.data;
  },

  upsertMedicalRecord: async (data: CreateMedicalRecordDto) => {
    const response = await apiClient.post('medical-records', data);
    return response.data.data;
  },

  searchICD10: async (query: string): Promise<ICD10Record[]> => {
    const response = await apiClient.get(`medical-records/icd10`, { params: { q: query } });
    return response.data.data;
  },
};
