export type PerformerType = 'TECHNICIAN' | 'DOCTOR';

export interface Service {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
  performerType?: PerformerType;
  categoryId?: string;
  category?: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  doctorServices?: {
    doctorProfile: {
      id: string;
      specialties: string[];
      qualifications: string[];
      user: {
        id: string;
        fullName: string;
        avatar?: string;
        email: string;
      }
    }
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  iconUrl?: string;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
  categoryId: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  isActive?: boolean;
}
