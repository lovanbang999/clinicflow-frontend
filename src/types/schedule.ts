// src/types/schedule.ts
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface WorkingHours {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface BreakTime {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface OffDay {
  id: string;
  doctorId: string;
  date: string;
  reason?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  availableSlots: number;
  maxSlots: number;
}

export interface AvailableSlotsQuery {
  doctorId: string;
  date: string;
  serviceId: string;
}

export interface SmartSuggestion {
  date: string;
  time: string;
  availableSlots: number;
  score: number;
}

export interface SmartSuggestionsQuery {
  doctorId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  limit?: number;
}
