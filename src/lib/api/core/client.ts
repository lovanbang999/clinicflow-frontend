import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Helper to get current locale from the window URL
 */
const getCurrentLocale = (): string => {
  if (typeof window === 'undefined') return 'vi';
  const path = window.location.pathname;
  const segments = path.split('/');
  // Expected segments: ["", "vi", "dashboard"] -> "vi"
  return ['vi', 'en'].includes(segments[1]) ? segments[1] : 'vi';
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add token from Zustand store
        const { accessToken } = useAuthStore.getState();
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const { refreshToken, setTokens } = useAuthStore.getState();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
              
              // Update Zustand store (this also updates localStorage via persist middleware)
              setTokens(newAccessToken, newRefreshToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              
              return this.client(originalRequest);
            } else {
               throw new Error('No refresh token available');
            }
          } catch (refreshError) {
            // Refresh token failed, clear auth and logout user
            useAuthStore.getState().clearAuth();
            
            if (typeof window !== 'undefined') {
              const locale = getCurrentLocale();
              window.location.href = `/${locale}/login`;
            }
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.data) {
          return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(refreshToken: string) {
    // Create a clean instance to avoid interceptor recursion during refresh
    return axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();
export default apiClient;

