// Domain types
export type DoctorStatus = 'Active' | 'OnLeave' | 'Inactive';

export type Specialty =
  | 'Cardiology'
  | 'Neurology'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Emergency'
  | 'Dermatology'
  | 'Oncology'
  | 'Psychiatry';

export type Doctor = {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  specialty: Specialty;
  experience: number; // years
  status: DoctorStatus;
};

// Style maps
export const SPECIALTY_STYLES: Record<string, string> = {
  Cardiology:  'bg-blue-50   text-blue-700   border-blue-100',
  Neurology:   'bg-purple-50 text-purple-700 border-purple-100',
  Pediatrics:  'bg-pink-50   text-pink-700   border-pink-100',
  Orthopedics: 'bg-orange-50 text-orange-700 border-orange-100',
  Emergency:   'bg-red-50    text-red-700    border-red-100',
  Dermatology: 'bg-teal-50   text-teal-700   border-teal-100',
  Oncology:    'bg-indigo-50 text-indigo-700 border-indigo-100',
  Psychiatry:  'bg-violet-50 text-violet-700 border-violet-100',
};

export const STATUS_STYLES: Record<DoctorStatus, { wrapper: string; dot: string }> = {
  Active:   { wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  OnLeave:  { wrapper: 'bg-amber-50   text-amber-700   border-amber-100',   dot: 'bg-amber-500'   },
  Inactive: { wrapper: 'bg-gray-100   text-gray-600    border-gray-200',    dot: 'bg-gray-500'    },
};

// Filter constants
export const ALL_SPECIALTIES: Specialty[] = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Emergency',  'Dermatology', 'Oncology', 'Psychiatry',
];

export const ALL_STATUSES: DoctorStatus[] = ['Active', 'OnLeave', 'Inactive'];

// Mock data — replace with API hook when backend is ready
export const MOCK_DOCTORS: Doctor[] = [
  { id: '1', fullName: 'Dr. Aris Sloan',    email: 'aris.sloan@clinic.com',    specialty: 'Cardiology',  experience: 12, status: 'Active'   },
  { id: '2', fullName: 'Dr. Elena Vance',   email: 'elena.vance@clinic.com',   specialty: 'Neurology',   experience: 8,  status: 'OnLeave'  },
  { id: '3', fullName: 'Dr. Marcus Thorne', email: 'marcus.t@clinic.com',      specialty: 'Pediatrics',  experience: 15, status: 'Active'   },
  { id: '4', fullName: 'Dr. Sarah Cohen',   email: 'sarah.cohen@clinic.com',   specialty: 'Orthopedics', experience: 6,  status: 'Active'   },
  { id: '5', fullName: 'Dr. James Wilson',  email: 'james.wilson@clinic.com',  specialty: 'Emergency',   experience: 20, status: 'Inactive' },
];
