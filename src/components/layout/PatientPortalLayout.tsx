'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { PatientPortalHeader } from './patient/PatientPortalHeader';
import { PatientPortalFooter } from './patient/PatientPortalFooter';
import { PatientPortalDarkModeToggle } from './patient/PatientPortalDarkModeToggle';

export function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated || !isClient) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, isClient, router]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!_hasHydrated || !isClient || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      <PatientPortalHeader user={user} />
  
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <PatientPortalFooter />
      <PatientPortalDarkModeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}
