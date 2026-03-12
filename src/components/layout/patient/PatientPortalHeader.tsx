import Link from 'next/link';
import { BellIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserCircleIcon, SignOutIcon, CalendarBlankIcon, FileTextIcon, GearIcon } from '@phosphor-icons/react';

interface PatientPortalHeaderProps {
  user: {
    id: string;
    fullName: string;
  };
}

const navItems = [
  {
    label: 'Home',
    href: '/patient',
  },
  {
    label: 'Book Appointment',
    href: '/patient/book',
  },
  {
    label: 'My Bookings',
    href: '/patient/bookings',
  },
];

export function PatientPortalHeader({ user }: PatientPortalHeaderProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-10">
            <Link href="/patient" className="flex items-center gap-2.5 group">
              <div className="bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 relative">
                <Image src="/logo.svg" alt="Logo" width={40} height={40} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Smart Clinic</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">

              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.endsWith(item.href);

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
          <div className="flex items-center gap-5">
            <LanguageSwitcher />
            <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative cursor-pointer">
              <BellIcon weight="bold" className="text-[24px]" />
              <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2.5 pl-1 cursor-pointer p-1.5 rounded-xl transition-colors">
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
                <DropdownMenuLabel className="font-normal px-2 py-3">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.fullName}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Patient ID: #{user.id.substring(0, 5)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 mb-1" />
                <div className="py-1">
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                    <Link href="/patient/profile" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <UserCircleIcon weight="fill" className="text-lg" />
                      </div>
                      <span className="font-semibold text-sm">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 mt-1 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                    <Link href="/patient/bookings" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <CalendarBlankIcon weight="fill" className="text-lg" />
                      </div>
                      <span className="font-semibold text-sm">My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 mt-1 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                    <Link href="/patient/records" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                        <FileTextIcon weight="fill" className="text-lg" />
                      </div>
                      <span className="font-semibold text-sm">Medical Records</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 mx-1 mt-1 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                    <Link href="/patient/settings" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <GearIcon weight="fill" className="text-lg" />
                      </div>
                      <span className="font-semibold text-sm">Settings</span>
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
                    <span className="font-bold text-sm">Logout</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
