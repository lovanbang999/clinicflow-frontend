export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  QUEUED = 'QUEUED',
  NO_SHOW = 'NO_SHOW',
}

export interface Booking {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  patientNotes?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  };
  doctor?: {
    id: string;
    fullName: string;
  };
  service?: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  };
  queueRecord?: QueueRecord;
}

export interface QueueRecord {
  id: string;
  bookingId: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  createdAt: string;
}

export interface CreateBookingDto {
  doctorId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  patientNotes?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  reason?: string;
  doctorNotes?: string;
}
