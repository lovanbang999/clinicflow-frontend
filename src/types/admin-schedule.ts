export interface AdminScheduleStats {
  totalAppointments: number;
  todaysSlots: number;
  canceledToday: number;
  avgWaitTime: number; // in minutes
}

export interface AdminScheduleSlot {
  id: string;
  doctorId: string;
  date: string; // ISO string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxPatients: number;
  currentPatients: number;
  roomId?: string;
  room?: {
    id: string;
    name: string;
  };
  type?: string;
  notes?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    fullName: string;
    doctorProfile?: {
      specialties: string[];
    };
  };
}

export interface AdminCreateScheduleDto {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  roomId?: string;
  type?: string;
  notes?: string;
  status?: string;
  isActive?: boolean;
}

export interface AdminUpdateScheduleDto {
  doctorId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  maxPatients?: number;
  roomId?: string;
  type?: string;
  notes?: string;
  status?: string;
  isActive?: boolean;
}

export interface AdminScheduleFilters {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AdminScheduleListResponse {
  data: AdminScheduleSlot[];
  meta: {
    total: number;
  };
}
