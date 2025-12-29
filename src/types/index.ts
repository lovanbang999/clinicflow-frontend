// Export all types
export * from './auth';
export * from './booking';
export * from './schedule';
export * from './service';

// Common API types
export interface ApiError {
  success: false;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  messageCode?: string;
  timestamp?: string;
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
