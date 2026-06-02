'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/user';

const ROLE_DASHBOARD: Record<UserRole, string> = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  RECEPTIONIST: '/receptionist',
  TECHNICIAN: '/technician/lab-worklist',
  PATIENT: '/patient',
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (isAuthenticated && user) {
      if (user.isPasswordTemp) {
        if (!pathname.endsWith('/change-password')) {
          router.push('/change-password');
        }
        return;
      }

      const target = ROLE_DASHBOARD[user.role];
      if (target) router.push(target);
    }
  }, [_hasHydrated, isAuthenticated, user, router, pathname]);

  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && !(user.isPasswordTemp && pathname.endsWith('/change-password'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
