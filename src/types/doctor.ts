// Frontend Doctor type
export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialties: string[];
  qualifications: string[];
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilters {
  specialty?: string;
  isActive?: boolean;
}

// Backend response types
export interface DoctorProfile {
  specialties: string[];
  qualifications: string[];
  yearsOfExperience: number;
  bio?: string;
  rating: number;
  reviewCount: number;
}

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  doctorProfile?: DoctorProfile;
}

export interface DoctorsListResponse {
  users: BackendUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
