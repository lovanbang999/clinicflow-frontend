// Export all types
export * from './auth';
export * from './booking';
export * from './schedule';
export * from './service';

// Common API types
export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  messageCode: string;
  errorMessage: string;
  errorCode: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  messageCode?: string;
  statusCode?: number;
  timestamp?: string;
}
