import {
  Stethoscope,
  Heart,
  Droplet,
  Smile,
  Eye,
  FlaskConical,
  Waves,
  Activity,
  Ear,
  Baby,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  'Khám tổng quát': Stethoscope,
  'Khám tim mạch': Heart,
  'Khám da liễu': Droplet,
  'Khám răng hàm mặt': Smile,
  'Khám mắt': Eye,
  'Xét nghiệm': FlaskConical,
  'Siêu âm tổng quát': Waves,
  'Nội soi': Activity,
  'Khám tai mũi họng': Ear,
  'Khám sản phụ khoa': Baby,
};

export const SERVICE_COLOR_MAP: Record<string, string> = {
  'Khám tổng quát': 'from-blue-500 to-cyan-500',
  'Khám tim mạch': 'from-red-500 to-pink-500',
  'Khám da liễu': 'from-teal-500 to-emerald-500',
  'Khám răng hàm mặt': 'from-indigo-500 to-purple-500',
  'Khám mắt': 'from-amber-500 to-orange-500',
  'Xét nghiệm': 'from-rose-500 to-red-500',
  'Siêu âm tổng quát': 'from-sky-500 to-blue-500',
  'Nội soi': 'from-violet-500 to-purple-500',
  'Khám tai mũi họng': 'from-lime-500 to-green-500',
  'Khám sản phụ khoa': 'from-pink-500 to-rose-500',
};

export function getServiceIcon(serviceName: string): LucideIcon {
  return SERVICE_ICON_MAP[serviceName] || Stethoscope;
}

export function getServiceColor(serviceName: string): string {
  return SERVICE_COLOR_MAP[serviceName] || 'from-slate-500 to-gray-500';
}
