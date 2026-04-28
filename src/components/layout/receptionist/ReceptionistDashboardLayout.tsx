'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { ReceptionistDashboardSidebar } from './ReceptionistDashboardSidebar';
import { ReceptionistDashboardHeader } from './ReceptionistDashboardHeader';
import { useTranslations } from 'next-intl';

interface ReceptionistDashboardLayoutProps {
  children: React.ReactNode;
}

export function ReceptionistDashboardLayout({ children }: ReceptionistDashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const t = useTranslations('adminLayout'); // Reuse loading from admin

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!_hasHydrated || !isClient) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, isClient, router]);

  if (!_hasHydrated || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f7f8]">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 text-[#1392ec]" />
          <p className="mt-4 text-sm text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f7f8]">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 text-[#1392ec]" />
          <p className="mt-4 text-sm text-slate-600">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard allowedRoles={['RECEPTIONIST']}>
      <div className="flex h-screen overflow-hidden bg-[#f6f7f8]">
        <ReceptionistDashboardSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ReceptionistDashboardHeader />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
