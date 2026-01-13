'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { Spinner } from '@/components/ui/spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication after hydration
  useEffect(() => {
    if (!_hasHydrated || !isClient) return;

    console.log('Hydration complete. isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login.');
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, isClient, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Show loading while hydrating
  if (!_hasHydrated || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <DashboardHeader user={user} onMenuClick={toggleSidebar} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <DashboardSidebar role={user.role} />
        </div>

        {/* Sidebar - Mobile */}
        <div
          className={`fixed left-0 z-50 h-[calc(100vh-4rem)] w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <DashboardSidebar role={user.role} />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Menu Button */}
      <Button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 p-0 shadow-lg hover:bg-blue-700 lg:hidden"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
}
