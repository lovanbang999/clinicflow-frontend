export interface Service {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
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
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  isActive?: boolean;
}
