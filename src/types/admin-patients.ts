export interface PatientRow {
  id: string;
  fullName: string;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  isActive: boolean;
  bloodType?: string | null;
  lastVisit?: string | null;
  nextAppointment?: string | null;
  assignedDoctor?: string | null;
  status?: 'active' | 'inactive' | 'pending';
}

export interface PatientKpiData {
  totalPatients?: number | null;
  newThisMonth?: number | null;
  patientsToday?: number | null;
  activeAppointments?: number | null;
  totalPatientsTrend?: number | null;
  newThisMonthTrend?: number | null;
  patientsTodayTrend?: number | null;
  activeAppointmentsTrend?: number | null;
}

export interface PatientSearchQuery {
  search?: string;
  page?: number;
  limit?: number;
  gender?: string;    // comma-separated DB values: 'MALE,FEMALE,OTHER'
  status?: string;    // comma-separated: 'active,inactive'
  bloodType?: string; // comma-separated: 'A+,O-'
}

export interface PatientSearchResponse {
  data: PatientRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminCreatePatientDto {
  email: string;
  fullName: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  address?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: string;
  allergies?: string;
  chronicConditions?: string;
  familyHistory?: string;
  bloodType?: string;
}

export type AdminUpdatePatientDto = Partial<AdminCreatePatientDto>;
