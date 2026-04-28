'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUIStore } from '@/lib/store/uiStore';
import {
  SquaresFourIcon,
  StethoscopeIcon,
  SyringeIcon,
  CalendarBlankIcon,
  ChartBarIcon,
  GearSixIcon,
  SignOutIcon,
  CurrencyCircleDollarIcon,
  type Icon,
  WheelchairIcon,
  IdentificationBadgeIcon,
  FolderIcon,
  DoorIcon,
} from '@phosphor-icons/react';

type NavItem = {
  key: string;
  href: string;
  icon: Icon;
  exact: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',         href: '/admin',                 icon: SquaresFourIcon,          exact: true },
  { key: 'userManagement',    href: '/admin/users',           icon: IdentificationBadgeIcon,  exact: false },
  { key: 'doctorManagement',  href: '/admin/doctors',         icon: StethoscopeIcon,          exact: false },
  { key: 'patientManagement', href: '/admin/patients',        icon: WheelchairIcon,           exact: false },
  { key: 'categoryManagement',href: '/admin/categories',      icon: FolderIcon,               exact: false },
  { key: 'serviceManagement', href: '/admin/services',        icon: SyringeIcon,              exact: false },
  { key: 'schedules',         href: '/admin/schedules',       icon: CalendarBlankIcon,        exact: false },
  { key: 'roomManagement',    href: '/admin/rooms',           icon: DoorIcon,                 exact: false },
  { key: 'billingManagement', href: '/admin/invoices',        icon: CurrencyCircleDollarIcon, exact: false },
  { key: 'analytics',         href: '/admin/analytics',       icon: ChartBarIcon,             exact: false },
  { key: 'settings',          href: '/admin/settings',        icon: GearSixIcon,              exact: false },
];

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

export default function AdminSidebar({ onNavItemClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations('adminLayout');
  const { isSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'bg-white border-r border-[#e5e7eb] flex flex-col shrink-0 h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'w-[70px]' : 'w-64',
      )}
    >
      {/* Brand */}
      <div className={cn(
        'flex items-center shrink-0 transition-all duration-300',
        isSidebarCollapsed ? 'justify-center p-4 py-5' : 'gap-3 p-6',
      )}>
        <Image src="/logo.svg" alt="Logo" width={36} height={36} className="shrink-0" />
        {!isSidebarCollapsed && (
          <div className="overflow-hidden flex flex-col justify-center">
            <h1 className="text-[#111518] text-lg font-bold leading-none truncate">Smart Clinic</h1>
            <p className="text-[#1392ec]/70 text-[10px] font-semibold uppercase tracking-wider mt-1 leading-tight line-clamp-2">
              {t('healthcare')}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 py-2 space-y-1 transition-all duration-300', isSidebarCollapsed ? 'px-2' : 'px-4')}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href || pathname.endsWith(item.href)
            : pathname.includes(item.href);
          const IconComponent = item.icon;
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                onClick={onNavItemClick}
                className={cn(
                  'flex items-center transition-all text-sm font-medium rounded-xl min-w-0',
                  isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-[#1392ec] text-white'
                    : 'text-[#64748b] hover:bg-[#1392ec]/10 hover:text-[#1392ec]',
                )}
              >
                <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{t(item.key)}</span>}
              </Link>
              {/* Tooltip in collapsed mode */}
              {isSidebarCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  {t(`nav.${item.key}`)}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={cn('border-t border-[#f0f3f4] shrink-0 transition-all duration-300', isSidebarCollapsed ? 'p-2' : 'p-4')}>
        <div className="relative group">
          <button
            onClick={() => logout()}
            className={cn(
              'w-full flex items-center rounded-xl text-[#64748b] hover:bg-red-50 hover:text-red-500 cursor-pointer transition-all text-sm font-medium min-w-0',
              isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            )}
          >
            <SignOutIcon size={22} weight="regular" className="shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">{t('logout')}</span>}
          </button>
          {isSidebarCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
              {t('logout')}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
