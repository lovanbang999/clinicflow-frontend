'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { User as UserType } from '@/types';

interface DashboardHeaderProps {
  user: UserType;
  onMenuClick: () => void;
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const t = useTranslations('common');
  const { logout } = useAuth();

  // Get user initials
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Get translated role
  const userRole = t(`roles.${user.role}`);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-blue-600">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Side - Logo & Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="text-white hover:bg-blue-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Image
                src="/logo.svg"
                alt="Smart Clinic"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="hidden text-xl font-bold text-white sm:inline">Smart Clinic</span>
          </Link>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-blue-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-medium">{user.fullName}</span>
                  <span className="text-xs text-blue-100">{userRole}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/patient/profile" className="flex cursor-pointer items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('menu.profile')}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/patient/settings" className="flex cursor-pointer items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>{t('menu.settings')}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => logout()}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('menu.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
