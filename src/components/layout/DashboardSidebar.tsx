'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarCheck,
  ClipboardList,
  Users,
  Settings,
  BarChart3,
  Stethoscope,
  Clock,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ('ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT')[];
}

const navItems: NavItem[] = [
  // Patient Navigation
  {
    label: 'Trang chủ',
    href: '/patient/dashboard',
    icon: Home,
    roles: ['PATIENT'],
  },
  {
    label: 'Lịch hẹn của tôi',
    href: '/patient/bookings',
    icon: CalendarCheck,
    roles: ['PATIENT'],
  },

  // Doctor Navigation
  {
    label: 'Lịch khám',
    href: '/doctor/schedule',
    icon: CalendarCheck,
    roles: ['DOCTOR'],
  },
  {
    label: 'Bệnh nhân',
    href: '/doctor/patients',
    icon: Users,
    roles: ['DOCTOR'],
  },
  {
    label: 'Cài đặt',
    href: '/doctor/settings',
    icon: Settings,
    roles: ['DOCTOR'],
  },

  // Receptionist Navigation
  {
    label: 'Dashboard',
    href: '/receptionist/dashboard',
    icon: Home,
    roles: ['RECEPTIONIST'],
  },
  {
    label: 'Check-in',
    href: '/receptionist/check-in',
    icon: ClipboardList,
    roles: ['RECEPTIONIST'],
  },
  {
    label: 'Hàng đợi',
    href: '/receptionist/queue',
    icon: Clock,
    roles: ['RECEPTIONIST'],
  },

  // Admin Navigation
  {
    label: 'Người dùng',
    href: '/admin/users',
    icon: UserCog,
    roles: ['ADMIN'],
  },
  {
    label: 'Dịch vụ',
    href: '/admin/services',
    icon: Stethoscope,
    roles: ['ADMIN'],
  },
  {
    label: 'Báo cáo',
    href: '/admin/reports',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
];

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  // Filter nav items by role
  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-slate-200 bg-white">
      <nav className="space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
