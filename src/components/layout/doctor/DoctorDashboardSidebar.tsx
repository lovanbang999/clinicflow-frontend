'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  HouseIcon,
  CalendarCheckIcon,
  UsersIcon,
  GearIcon,
  SignOutIcon,
  type Icon,
} from '@phosphor-icons/react';

type NavItem = {
  key: string;
  href: string;
  icon: Icon;
  exact: boolean;
};

export const NAV_ITEMS_DOCTOR: NavItem[] = [
  { key: 'dashboard', href: '/doctor',            icon: HouseIcon,          exact: true },
  { key: 'schedule',  href: '/doctor/schedule',   icon: CalendarCheckIcon,  exact: false },
  { key: 'patients',  href: '/doctor/patients',   icon: UsersIcon,          exact: false },
  { key: 'settings',  href: '/doctor/settings',   icon: GearIcon,           exact: false },
];

export function DoctorDashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations('dashboard.doctor');
  const tCommon = useTranslations('common');

  return (
    <aside className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col shrink-0 h-full overflow-y-auto">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 shrink-0">
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        <div>
          <h1 className="text-[#111518] text-lg font-bold leading-none">Smart Clinic</h1>
          <p className="text-[#1392ec]/70 text-xs font-semibold uppercase tracking-wider mt-1">
            {t('healthcare')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {NAV_ITEMS_DOCTOR.map((item) => {
          let isActive = false;
          if (item.key === 'dashboard') {
             const doctorPathIndex = pathname.indexOf('/doctor');
             if (doctorPathIndex !== -1) {
               const pathAfterDoctor = pathname.substring(doctorPathIndex + '/doctor'.length);
               const segments = pathAfterDoctor.split('/').filter(Boolean);
               const firstSegment = segments[0];
               if (!firstSegment || !['schedule', 'patients', 'settings'].includes(firstSegment)) {
                 isActive = true;
               }
             }
          } else {
             isActive = pathname.includes(item.href);
          }
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                isActive
                  ? 'bg-[#1392ec] text-white'
                  : 'text-[#64748b] hover:bg-[#1392ec]/10 hover:text-[#1392ec]',
              )}
            >
              <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#f0f3f4] shrink-0">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#64748b] hover:bg-red-50 hover:text-red-500 cursor-pointer transition-all text-sm font-medium"
        >
          <SignOutIcon size={22} weight="regular" />
          <span>{tCommon('menu.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
