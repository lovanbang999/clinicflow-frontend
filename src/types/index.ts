// src/types/index.ts
export * from './auth';
export * from './booking';
export * from './service';
export * from './schedule';

// Common API types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
