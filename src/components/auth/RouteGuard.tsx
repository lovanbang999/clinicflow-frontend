'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/user';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated || !user) {
      const callbackUrl = encodeURIComponent(pathname + window.location.search);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (user.isPasswordTemp) {
      router.push('/change-password');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dashboardByRole: Record<UserRole, string> = {
        ADMIN: '/admin/users',
        DOCTOR: '/doctor/schedule',
        RECEPTIONIST: '/receptionist',
        TECHNICIAN: '/technician/lab-worklist',
        PATIENT: '/patient',
      };
      router.push(dashboardByRole[user.role] ?? '/login');
    }
  }, [_hasHydrated, isAuthenticated, user, allowedRoles, router, pathname]);

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

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
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
