'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    // Wait for hydration
    if (!_hasHydrated) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // Redirect to login page
      const locale = pathname.split('/')[1]; // Extract locale from path
      router.push(`/${locale}/login`);
      return;
    }

    // Check if user has the required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const locale = pathname.split('/')[1];
      switch (user.role) {
        case 'ADMIN':
          router.push(`/${locale}/admin/users`);
          break;
        case 'DOCTOR':
          router.push(`/${locale}/doctor/schedule`);
          break;
        case 'RECEPTIONIST':
          router.push(`/${locale}/receptionist/check-in`);
          break;
        case 'PATIENT':
          router.push(`/${locale}/patient/dashboard`);
          break;
        default:
          router.push(`/${locale}/login`);
      }
      return;
    }
  }, [_hasHydrated, isAuthenticated, user, allowedRoles, router, pathname]);

  // Show loading while hydrating or not authenticated
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

  // Don't render children if not authenticated or wrong role
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

  // Check role authorization
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
