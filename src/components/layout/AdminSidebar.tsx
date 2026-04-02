'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
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
} from '@phosphor-icons/react';

type NavItem = {
  key: string;
  href: string;
  icon: Icon;
  exact: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',         href: '/admin',                 icon: SquaresFourIcon,   exact: true },
  { key: 'userManagement',    href: '/admin/users',           icon: IdentificationBadgeIcon, exact: false },
  { key: 'doctorManagement',  href: '/admin/doctors',         icon: StethoscopeIcon,   exact: false },
  { key: 'patientManagement', href: '/admin/patients',        icon: WheelchairIcon,    exact: false },
  { key: 'categoryManagement',href: '/admin/categories',      icon: FolderIcon,        exact: false },
  { key: 'serviceManagement', href: '/admin/services',        icon: SyringeIcon,       exact: false },
  { key: 'schedules',         href: '/admin/schedules',       icon: CalendarBlankIcon, exact: false },
  { key: 'billingManagement', href: '/admin/invoices',       icon: CurrencyCircleDollarIcon, exact: false },
  { key: 'analytics',         href: '/admin/analytics',       icon: ChartBarIcon,      exact: false },
  { key: 'settings',          href: '/admin/settings',        icon: GearSixIcon,       exact: false },
];

interface AdminSidebarProps {
  onNavItemClick?: () => void;
}

export default function AdminSidebar({ onNavItemClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations('dashboard.admin');

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
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href || pathname.endsWith(item.href)
            : pathname.includes(item.href);
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavItemClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                isActive
                  ? 'bg-[#1392ec] text-white'
                  : 'text-[#64748b] hover:bg-[#1392ec]/10 hover:text-[#1392ec]',
              )}
            >
              <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} />
              <span>{t(`nav.${item.key}`)}</span>
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
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
