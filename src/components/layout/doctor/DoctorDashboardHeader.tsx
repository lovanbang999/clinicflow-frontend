'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { NotificationBell } from '../NotificationBell';
import { LanguageSwitcher } from '../../shared/LanguageSwitcher';
import { NAV_ITEMS_DOCTOR } from './DoctorDashboardSidebar';
import { useUIStore } from '@/lib/store/uiStore';
import { SidebarSimpleIcon } from '@phosphor-icons/react';

export function DoctorDashboardHeader() {
  const { user } = useAuthStore();
  const t = useTranslations('doctorLayout');
  const pathname = usePathname();
  const { toggleSidebarCollapsed } = useUIStore();

  const activeItem = NAV_ITEMS_DOCTOR.find((item) =>
    item.exact
      ? pathname === item.href || pathname.endsWith(item.href)
      : pathname.includes(item.href),
  );
  
  const pageTitle = activeItem ? t(activeItem.key) : t('dashboard');

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  return (
    <header className="h-20 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left: Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebarCollapsed}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <SidebarSimpleIcon size={22} weight="regular" />
        </button>
        <h2 className="text-[#111518] text-xl font-bold tracking-tight">{pageTitle}</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationBell />

        {/* User profile */}
        <div className="flex items-center gap-3 pl-5 border-l border-[#e5e7eb]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#111518] leading-none">
              {user?.fullName || t('title')}
            </p>
            <p className="text-xs text-[#64748b] font-medium mt-1 uppercase">{user?.role}</p>
          </div>
          <div className="size-10 rounded-full bg-[#1392ec]/10 border-2 border-[#1392ec]/20 flex items-center justify-center text-[#1392ec] font-bold text-sm shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
