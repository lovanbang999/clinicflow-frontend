'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { AdminFooter } from '@/components/layout/AdminFooter';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const t = useTranslations('adminLayout');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-[#f6f7f8] relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 w-64 shrink-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
           <AdminSidebar onNavItemClick={() => setIsMobileMenuOpen(false)} />
        </div>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <AdminHeader onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <div className="flex-1 overflow-y-auto">{children}</div>
          <AdminFooter />
        </main>
      </div>
    </RouteGuard>
  );
}
