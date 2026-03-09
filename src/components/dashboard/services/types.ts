export interface Service {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ServiceForm {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  maxSlotsPerHour: string;
  isActive: boolean;
}

export const DEFAULT_SERVICE_FORM: ServiceForm = {
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
  maxSlotsPerHour: '3',
  isActive: true,
};

export const ICON_COLORS = [
  'bg-blue-50 text-[#1392ec]',
  'bg-purple-50 text-purple-600',
  'bg-rose-50 text-rose-600',
  'bg-orange-50 text-orange-600',
  'bg-cyan-50 text-cyan-600',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-indigo-50 text-indigo-600',
] as const;

export function iconColor(idx: number) {
  return ICON_COLORS[idx % ICON_COLORS.length];
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
