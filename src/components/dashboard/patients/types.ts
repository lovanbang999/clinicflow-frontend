// Domain types
export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER';
export type PatientStatus = 'active' | 'inactive' | 'pending';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// Filter constants
export const ALL_GENDERS: PatientGender[] = ['MALE', 'FEMALE', 'OTHER'];
export const ALL_STATUSES: PatientStatus[] = ['active', 'inactive', 'pending'];
export const ALL_BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Style maps
export const GENDER_STYLES: Record<PatientGender, string> = {
  MALE:   'bg-blue-50  text-blue-700  border-blue-100',
  FEMALE: 'bg-pink-50  text-pink-700  border-pink-100',
  OTHER:  'bg-gray-50  text-gray-700  border-gray-200',
};

export const STATUS_STYLES: Record<PatientStatus, { wrapper: string; dot: string }> = {
  active:   { wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  inactive: { wrapper: 'bg-gray-100   text-gray-600    border-gray-200',    dot: 'bg-gray-500'    },
  pending:  { wrapper: 'bg-amber-50   text-amber-700   border-amber-100',   dot: 'bg-amber-500'   },
};

export const BLOOD_TYPE_STYLES: Record<BloodType, string> = {
  'A+':  'bg-red-50    text-red-700    border-red-100',
  'A-':  'bg-red-50    text-red-600    border-red-100',
  'B+':  'bg-orange-50 text-orange-700 border-orange-100',
  'B-':  'bg-orange-50 text-orange-600 border-orange-100',
  'AB+': 'bg-purple-50 text-purple-700 border-purple-100',
  'AB-': 'bg-purple-50 text-purple-600 border-purple-100',
  'O+':  'bg-teal-50   text-teal-700   border-teal-100',
  'O-':  'bg-teal-50   text-teal-600   border-teal-100',
};
