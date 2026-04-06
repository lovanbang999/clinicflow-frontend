'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { PatientPortalHeader } from './patient/PatientPortalHeader';
import { PatientPortalFooter } from './patient/PatientPortalFooter';
import { useThemeStore } from '@/lib/store/themeStore';

export function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { isDark } = useThemeStore();
  const [isClient, setIsClient] = useState(false);

  // Hide footer and remove main padding on full-screen pages (e.g. chat)
  const isFullScreen = pathname?.includes('/patient/chat');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark, isClient]);

  useEffect(() => {
    if (!_hasHydrated || !isClient) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, isClient, router]);

  if (!_hasHydrated || !isClient || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-200 ${
        isFullScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {isFullScreen ? (
        <div className="hidden md:block">
          <PatientPortalHeader user={user} />
        </div>
      ) : (
        <PatientPortalHeader user={user} />
      )}

      <main className={isFullScreen ? 'flex-1 flex flex-col min-h-0' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4'}>
        {children}
      </main>

      {!isFullScreen && <PatientPortalFooter />}
    </div>
  );
}

