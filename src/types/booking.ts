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

export enum LabOrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface LabOrder {
  id: string;
  testName: string;
  testDescription?: string;
  status: LabOrderStatus | string;
  orderedAt: string;
}

export interface Booking {
  id: string;
  bookingCode?: string;
  patientProfileId: string;
  doctorId: string;
  serviceId?: string | null;
  bookingDate: string;
  startTime?: string | null;   // null for walk-in bookings
  endTime?: string | null;     // null for walk-in bookings
  isPreBooked: boolean;        // true = slot reserved, false = walk-in queue
  estimatedTime?: string | null; // Calculated for walk-in patients
  status: BookingStatus;
  patientNotes?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
  roomId?: string;

  // Populated fields
  patientProfile?: {
    id: string;
    fullName: string;
    phone: string;
    patientCode: string;
    dateOfBirth?: string;
    gender?: string;
    allergies?: string;
    chronicConditions?: string;
    weightKg?: number;
    heightCm?: number;
  };
  doctor?: {
    id: string;
    fullName: string;
  };
  room?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  };
    medicalRecord?: {
      id: string;
      isFinalized: boolean;
      visitStep?: string | null;
      chiefComplaint?: string;
      clinicalFindings?: string;
      diagnosisCode?: string;
      diagnosisName?: string;
      treatmentPlan?: string;
      doctorNotes?: string;
      followUpDate?: string;
      followUpNote?: string;
      prescription?: {
        id: string;
        items: Array<{
          medicineName: string;
          dosage: string;
          frequency: string;
          durationDays?: number;
          quantity: number;
          unit: string;
          instructions?: string;
        }>;
      };
      labOrders?: LabOrder[];
    };
  queueRecord?: QueueRecord;
  invoices?: Array<{
    id: string;
    status: string;
    invoiceType: string;
    totalAmount: number;
  }>;
}

export interface QueueRecord {
  id: string;
  bookingId: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  isPreBooked: boolean;     // Denorm from Booking
  scheduledTime?: string | null; // Denorm from Booking.startTime
  createdAt: string;
}

export interface CreateBookingDto {
  patientProfileId: string;
  doctorId: string;
  serviceId?: string | null;
  bookingDate: string;
  startTime?: string;      // Required for pre-bookings, omit for walk-in
  isPreBooked?: boolean;   // true = pre-booking, false = walk-in queue
  patientNotes?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  reason?: string;
  doctorNotes?: string;
}

export interface DoctorPatientSummary {
  id: string; // patientProfileId
  patientCode: string;
  fullName: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  bloodType: string | null;
  allergies: string | null;
  totalVisits: number;
  lastVisitDate: string | null;
  lastServiceName: string | null;
}
