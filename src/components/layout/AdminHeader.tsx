'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { Bell } from 'lucide-react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export default function AdminHeader() {
  const { user } = useAuthStore();
  const t = useTranslations('dashboard.admin');
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className="h-20 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-8 shrink-0">
      {/* Title */}
      <div>
        <h2 className="text-[#111518] text-xl font-bold tracking-tight">{t('dashboard')}</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        <LanguageSwitcher />

        {/* Notifications */}
        <button className="relative text-[#64748b] hover:text-[#1392ec] transition-colors p-1">
          <Bell size={24} />
          <span className="absolute top-0 right-0 size-3 bg-red-500 border-2 border-white rounded-full" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-5 border-l border-[#e5e7eb]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#111518] leading-none">
              {user?.fullName || t('title')}
            </p>
            <p className="text-xs text-[#64748b] font-medium mt-1">{user?.role}</p>
          </div>
          <div className="size-10 rounded-full bg-[#1392ec]/10 border-2 border-[#1392ec]/20 flex items-center justify-center text-[#1392ec] font-bold text-sm shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
