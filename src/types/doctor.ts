// Service info returned inside doctor profile
export interface DoctorServiceItem {
  id: string;
  name: string;
  category: string | null;
}

// Frontend Doctor type
export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  specialties: string[];
  qualifications: string[];
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  bio?: string;
  services: DoctorServiceItem[]; // Services this doctor can perform
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilters {
  serviceId?: string; // Filter by service ID
}

// Backend response types
export interface DoctorProfile {
  specialties: string[];
  qualifications: string[];
  yearsOfExperience: number;
  bio?: string;
  rating: number;
  reviewCount: number;
  // Nested services from DoctorService join table
  services?: Array<{
    service: DoctorServiceItem;
  }>;
}

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: string;
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
