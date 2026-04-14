export interface Service {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
  categoryId?: string;
  category?: {
    id: string;
    code: string;
    name: string;
  };
  doctorServices?: {
    doctorProfile: {
      user: {
        id: string;
        fullName: string;
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
