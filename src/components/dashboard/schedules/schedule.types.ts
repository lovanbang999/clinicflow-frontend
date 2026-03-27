import { AdminScheduleSlot } from '@/types';

export const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export type DoctorColor = {
  bg: string;
  border: string;
  text: string;
  textDark: string;
  textLight: string;
  pill: string;
};

const COLOR_PALETTE: DoctorColor[] = [
  { bg: 'bg-blue-100', border: 'border-[#1392ec]', text: 'text-[#1392ec]', textDark: 'text-blue-900', textLight: 'text-[#1392ec]/70', pill: 'bg-blue-100 text-blue-800 border-blue-200' },
  { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-600', textDark: 'text-green-900', textLight: 'text-green-700', pill: 'bg-green-100 text-green-800 border-green-200' },
  { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-600', textDark: 'text-emerald-900', textLight: 'text-emerald-700', pill: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-600', textDark: 'text-amber-900', textLight: 'text-amber-700', pill: 'bg-amber-100 text-amber-800 border-amber-200' },
  { bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-600', textDark: 'text-rose-900', textLight: 'text-rose-700', pill: 'bg-rose-100 text-rose-800 border-rose-200' },
];

export function getDoctorColor(doctorId: string): DoctorColor {
  const idx = [...doctorId].reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLOR_PALETTE.length;
  return COLOR_PALETTE[idx];
}

export type VisibleDoctor = AdminScheduleSlot['doctor'];

export const STATUS_STYLES: Record<string, { wrapper: string; dot: string }> = {
  scheduled: { wrapper: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  completed: { wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  canceled: { wrapper: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};
