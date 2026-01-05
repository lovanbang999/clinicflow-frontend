import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      clearAuth: () => 
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
        }),
      
      login: (user, accessToken, refreshToken) => 
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: true,
        }),
      
      logout: () => {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
