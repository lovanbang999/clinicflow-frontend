import { BookingStatus } from '@/types';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Chờ xác nhận',
  [BookingStatus.CONFIRMED]: 'Đã xác nhận',
  [BookingStatus.CHECKED_IN]: 'Đã check-in',
  [BookingStatus.IN_PROGRESS]: 'Đang khám',
  [BookingStatus.COMPLETED]: 'Đã hoàn thành',
  [BookingStatus.CANCELLED]: 'Đã hủy',
  [BookingStatus.QUEUED]: 'Trong hàng đợi',
  [BookingStatus.NO_SHOW]: 'Vắng mặt',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [BookingStatus.CHECKED_IN]: 'bg-green-100 text-green-800',
  [BookingStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [BookingStatus.QUEUED]: 'bg-indigo-100 text-indigo-800',
  [BookingStatus.NO_SHOW]: 'bg-gray-100 text-gray-800',
};

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Thứ 2' },
  { value: 'TUESDAY', label: 'Thứ 3' },
  { value: 'WEDNESDAY', label: 'Thứ 4' },
  { value: 'THURSDAY', label: 'Thứ 5' },
  { value: 'FRIDAY', label: 'Thứ 6' },
  { value: 'SATURDAY', label: 'Thứ 7' },
  { value: 'SUNDAY', label: 'Chủ nhật' },
];

export const DURATION_OPTIONS = [
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '60 phút' },
  { value: 90, label: '90 phút' },
];

export const MAX_SLOTS_OPTIONS = [
  { value: 1, label: '1 slot/giờ' },
  { value: 2, label: '2 slots/giờ' },
  { value: 3, label: '3 slots/giờ' },
  { value: 4, label: '4 slots/giờ' },
  { value: 5, label: '5 slots/giờ' },
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/users/profile',
  },
  BOOKINGS: {
    BASE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
  },
  SERVICES: {
    BASE: '/services',
  },
  SCHEDULES: {
    AVAILABLE_SLOTS: '/schedules/available-slots',
    WORKING_HOURS: '/schedules/working-hours',
  },
  SUGGESTIONS: {
    TIME_SLOTS: '/suggestions/time-slots',
  },
};
