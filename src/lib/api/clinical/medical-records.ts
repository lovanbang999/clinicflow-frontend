import { apiClient } from '@/lib/api/core/client';
import { type LabOrder } from '@/lib/api/clinical/lab-orders';
import { type SpecialistFindings } from '@/lib/types/specialist-findings.types';

export interface MedicalRecordRef {
  id: string;
  diagnosisName?: string;
  treatmentPlan?: string;
}

export interface PrescriptionRef {
  id: string;
  items: Array<{ medicineName: string }>;
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

export interface VisitHistoryItem {
  id: string; // medicalRecord.id
  bookingId: string;
  patientProfileId: string;
  chiefComplaint?: string;
  clinicalFindings?: string;
  diagnosisCode?: string;
  diagnosisName?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  followUpNote?: string;
  doctorNotes?: string;
  visitStep?: string;
  // Vitals
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  weightKg?: number;
  heightCm?: number;
  createdAt: string;
  booking: {
    id: string;
    bookingDate: string;
    status: string;
    reasonForVisit?: string;
    doctor: { id: string; fullName: string; title?: string };
    service: { id: string; name: string };
  };
  visitServiceOrders: Array<{
    id: string;
    status: string;
    resultText?: string;
    resultFileUrl?: string;
    isAbnormal?: boolean;
    abnormalNote?: string;
    service: { id: string; name: string };
  }>;
  labOrders?: Array<{
    id: string;
    status: string;
    testName: string;
    result?: {
      id: string;
      resultText?: string;
      resultFileUrl?: string;
      isAbnormal?: boolean;
    };
    service: { id: string; name: string };
  }>;
  prescription?: {
    id: string;
    notes?: string;
    items: Array<{
      id: string;
      medicineName: string;
      dosage: string;
      frequency: string;
      durationDays?: number;
      quantity: number;
      unit?: string;
      instructions?: string;
    }>;
  };
}

export interface PatientHistoryResponse {
  patientProfile: PatientMedicalProfile;
  visits: VisitHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** @deprecated Use PrescriptionItemInput instead */
export type PrescriptionItemDto = PrescriptionItemInput;

/** @deprecated Use medicalRecordsApi.upsertMedicalRecord */
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
  prescriptionItems?: PrescriptionItemInput[];
}

export interface ICD10Record {
  code: string;
  name: string;
}

export type VisitStep =
  | 'SYMPTOMS_TAKEN'
  | 'SERVICES_ORDERED'
  | 'AWAITING_RESULTS'
  | 'RESULTS_READY'
  | 'DIAGNOSED'
  | 'PRESCRIBED'
  | 'COMPLETED';

export type ServiceOrderStatus = 'PENDING' | 'PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface VisitServiceOrder {
  id: string;
  medicalRecordId: string;
  serviceId: string;
  bookingId: string;
  patientProfileId: string;
  status: ServiceOrderStatus;
  orderedBy: string;
  performedBy?: string;
  performer?: { id: string; fullName: string };
  resultText?: string;
  resultFileUrl?: string;
  isAbnormal?: boolean;
  abnormalNote?: string;
  startedAt?: string;
  completedAt?: string;
  paidAt?: string;
  queueNumber?: number;
  specialistNote?: string;
  findings?: SpecialistFindings;
  createdAt: string;
  service: {
    id: string;
    name: string;
    category?: string;
    serviceCode?: string;
    price?: number;
  };
  medicalRecord?: {
    id: string;
    chiefComplaint?: string;
    clinicalFindings?: string;
    doctorNotes?: string;
    booking?: {
      id: string;
      bookingCode?: string;
      patientNotes?: string;
      doctor?: {
        fullName?: string;
      };
      patientProfile?: {
        fullName?: string;
        patientCode?: string;
        dateOfBirth?: string;
        gender?: string;
        phone?: string;
      };
    };
  };
}

export interface VisitResultsResponse {
  id: string;
  bookingId: string;
  visitStep: VisitStep;
  version: number;
  chiefComplaint?: string;
  clinicalFindings?: string;
  doctorNotes?: string;
  diagnosisCode?: string;
  diagnosisName?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  followUpNote?: string;
  symptomsAt?: string;
  orderedAt?: string;
  diagnosedAt?: string;
  prescribedAt?: string;
  visitServiceOrders: VisitServiceOrder[];
  labOrders: LabOrder[];
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  additionalSymptoms?: string;
  medicalHistory?: string;
  allergies?: string;
  booking?: {
    id: string;
    patientProfile: {
      id: string;
      fullName: string;
      patientCode?: string;
      dateOfBirth?: string;
      gender?: string;
      address?: string;
      phone?: string;
    };
    doctor: {
      id: string;
      fullName: string;
      title?: string;
    };
  };
  prescription?: {
    id: string;
    notes?: string;
    items: Array<{
      id: string;
      visitServiceOrderId?: string;
      labOrderId?: string;
      medicineName: string;
      dosage: string;
      frequency: string;
      durationDays?: number;
      quantity: number;
      unit: string;
      instructions?: string;
      sortOrder: number;
    }>;
  };
}

export interface DoctorStatsResponse {
  totalPatientsSeen: number;
  patientsSeenToday: number;
  pendingActive: number;
  abnormalResultsToday: number;
}

export interface SaveSymptomsDto {
  chiefComplaint?: string;
  clinicalFindings?: string;
  doctorNotes?: string;
  additionalSymptoms?: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  medicalHistory?: string;
  allergies?: string;
  followUpNote?: string;
}

export interface OrderServiceItem {
  serviceId: string;
  performedBy?: string;
}

export interface OrderServicesDto {
  items: OrderServiceItem[];
}

export interface SaveDiagnosisDto {
  diagnosisCode?: string;
  diagnosisName?: string;
  treatmentPlan?: string;
  doctorNotes?: string;
  followUpDate?: string;
  followUpNote?: string;
}

export interface PrescriptionItemInput {
  visitServiceOrderId?: string;
  labOrderId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  quantity: number;
  unit?: string;
  instructions?: string;
  sortOrder?: number;
}

export interface CreatePrescriptionDto {
  notes?: string;
  items: PrescriptionItemInput[];
}

export interface CompleteSpecialistExamInput {
  resultText: string;
  doctorNotes?: string;
  isAbnormal?: boolean;
  abnormalNote?: string;
  findings?: SpecialistFindings;
}

// API

export const medicalRecordsApi = {
  // Legacy
  upsertMedicalRecord: async (data: {
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
    prescriptionItems?: PrescriptionItemInput[];
  }) => {
    const res = await apiClient.post('medical-records', data);
    return res.data.data;
  },

  // Step 1
  saveSymptoms: async (bookingId: string, dto: SaveSymptomsDto) => {
    const res = await apiClient.patch(`medical-records/${bookingId}/symptoms`, dto);
    return res.data.data;
  },

  // Step 2
  orderServices: async (bookingId: string, dto: OrderServicesDto) => {
    const res = await apiClient.post(`medical-records/${bookingId}/service-orders`, dto);
    return res.data.data as { record: VisitResultsResponse; orders: VisitServiceOrder[] };
  },
  removeServiceOrder: async (bookingId: string, orderId: string) => {
    const res = await apiClient.delete(`medical-records/${bookingId}/service-orders/${orderId}`);
    return res.data;
  },

  // Step 4
  getVisitResults: async (bookingId: string): Promise<VisitResultsResponse> => {
    const res = await apiClient.get(`medical-records/${bookingId}/results`);
    return res.data.data;
  },
  saveDiagnosis: async (bookingId: string, dto: SaveDiagnosisDto) => {
    const res = await apiClient.patch(`medical-records/${bookingId}/diagnose`, dto);
    return res.data.data;
  },

  // Step 5
  savePrescription: async (bookingId: string, dto: CreatePrescriptionDto) => {
    const res = await apiClient.post(`medical-records/${bookingId}/prescriptions`, dto);
    return res.data.data;
  },

  // Search
  searchICD10: async (query: string) => {
    const res = await apiClient.get('medical-records/icd10', { params: { q: query } });
    return res.data.data as Array<{ code: string; name: string }>;
  },

  // Patient history
  getPatientHistory: async (patientProfileId: string, page = 1, limit = 10) => {
    const res = await apiClient.get(`medical-records/patient/${patientProfileId}/history`, {
      params: { page, limit },
    });
    return res.data.data;
  },

  // Patient Self-Service
  getMyVisits: async (page = 1, limit = 10) => {
    const res = await apiClient.get('medical-records/patient/my-visits', {
      params: { page, limit },
    });
    return res.data.data;
  },
  getPatientStats: async () => {
    const res = await apiClient.get('medical-records/patient/my-stats');
    return res.data.data;
  },
  
  // Doctor Stats
  getDoctorStats: async (): Promise<DoctorStatsResponse> => {
    const res = await apiClient.get('medical-records/doctor/stats');
    return res.data.data;
  },

  fulfillPrescription: async (bookingId: string, pharmacyInvoiceId?: string) => {
    const res = await apiClient.patch(`medical-records/${bookingId}/prescriptions/fulfill`, {
      pharmacyInvoiceId,
    });
    return res.data.data;
  },

  // B4' — Specialist Workflow
  startSpecialistExamination: async (vsoId: string) => {
    const res = await apiClient.patch(`medical-records/specialist-orders/${vsoId}/start`);
    return res.data.data as VisitServiceOrder;
  },
  completeSpecialistExamination: async (vsoId: string, dto: CompleteSpecialistExamInput) => {
    const res = await apiClient.patch(`medical-records/specialist-orders/${vsoId}/complete`, dto);
    return res.data.data as VisitServiceOrder;
  },
};
