'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration
    if (!_hasHydrated) {
      return;
    }

    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated && user) {
      const locale = pathname.split('/')[1]; // Extract locale from path
      
      // If user has a temporary password, redirect them to change-password if not already there
      if (user.isPasswordTemp) {
        if (!pathname.endsWith('/change-password')) {
          router.push(`/${locale}/change-password`);
        }
        return;
      }

      switch (user.role) {
        case 'ADMIN':
          router.push(`/${locale}/admin`);
          break;
        case 'DOCTOR':
          router.push(`/${locale}/doctor`);
          break;
        case 'RECEPTIONIST':
          router.push(`/${locale}/receptionist`);
          break;
        case 'TECHNICIAN':
          router.push(`/${locale}/technician/lab-worklist`);
          break;
        case 'PATIENT':
          router.push(`/${locale}/patient`);
          break;
      }
      return;
    }
  }, [_hasHydrated, isAuthenticated, user, router, pathname]);

  // Show loading while hydrating
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

  // Show loading while redirecting authenticated users
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
