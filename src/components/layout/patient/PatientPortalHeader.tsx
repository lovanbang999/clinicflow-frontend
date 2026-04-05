import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { NotificationBell } from '@/components/layout/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  UserCircleIcon,
  SignOutIcon,
  GearIcon,
  ListIcon,
  XIcon
} from '@phosphor-icons/react';
import { useState } from 'react';

interface PatientPortalHeaderProps {
  user: {
    id: string;
    fullName: string;
  };
}

export function PatientPortalHeader({ user }: PatientPortalHeaderProps) {
  const t = useTranslations('patientOverview');
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: t('title'),
      href: '/patient',
      exact: true,
    },
    {
      label: t('book'),
      href: '/patient/book',
      exact: false,
    },
    {
      label: t('bookings'),
      href: '/patient/my-bookings',
      exact: false,
    },
    {
      label: t('history'),
      href: '/patient/history',
      exact: false,
    },
    {
      label: t('invoices'),
      href: '/patient/invoices',
      exact: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-10">
            <Link href="/patient" className="flex items-center gap-2.5 group">
              <div className="bg-blue-500 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 relative">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} className="md:w-10 md:h-10" />
              </div>
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Smart Clinic</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-semibold transition-colors ${isActive
                      ? 'text-blue-500'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <NotificationBell />
            
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            
            {/* Desktop Avatar Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 pl-1 cursor-pointer p-1.5 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">{user.fullName}</p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">Patient ID: #{user.id.substring(0, 5)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-slate-800 shadow-md">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 p-2 rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                  <DropdownMenuLabel className="font-normal px-2 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.fullName}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Patient ID: #{user.id.substring(0, 5)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <div className="py-1">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                      <Link href="/patient/profile" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <UserCircleIcon weight="fill" className="text-lg" />
                        </div>
                        <span className="font-semibold text-sm">{t('myProfile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 mt-1 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                      <Link href="/patient/settings" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <GearIcon weight="fill" className="text-lg" />
                        </div>
                        <span className="font-semibold text-sm">{t('settings')}</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 mt-1 text-red-600 focus:text-red-700 bg-red-50/50 hover:bg-red-50 focus:bg-red-100 dark:text-red-400 dark:focus:text-red-300 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:focus:bg-red-500/30 transition-colors"
                    onClick={() => logout()}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500">
                        <SignOutIcon weight="bold" className="text-lg" />
                      </div>
                      <span className="font-bold text-sm">{t('logout')}</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? <XIcon size={24} weight="bold" /> : <ListIcon size={24} weight="bold" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-4 space-y-2">
            {/* Mobile User Info */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-[1rem] border border-slate-100 dark:border-slate-800/60">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 flex items-center justify-center text-white text-xl font-black ring-4 ring-white dark:ring-slate-900 shadow-xl">
                {user.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{user.fullName}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{user.id.substring(0, 8)}</p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${isActive
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className="uppercase tracking-tight">{item.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />

            <div className="space-y-4">
              <div className="px-2">
                <LanguageSwitcher />
              </div>
              
              <div className="grid grid-cols-2 gap-3 px-2">
                <Link 
                  href="/patient/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <UserCircleIcon size={24} weight="fill" className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase mt-2 tracking-widest text-slate-600 dark:text-slate-400">{t('myProfile')}</span>
                </Link>
                <Link 
                  href="/patient/settings" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <GearIcon size={24} weight="fill" className="text-slate-500 dark:text-slate-400" />
                  <span className="text-[10px] font-black uppercase mt-2 tracking-widest text-slate-600 dark:text-slate-400">{t('settings')}</span>
                </Link>
              </div>

              <div className="px-2">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20 active:scale-[0.98]"
                >
                  <SignOutIcon size={18} weight="bold" />
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
