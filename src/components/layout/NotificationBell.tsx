'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/clinic/useNotifications';
import { useTranslations } from 'next-intl';
import { NotificationList } from '@/components/notifications/NotificationList';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('common.notifications');
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewAll = () => {
    setIsOpen(false);
    if (!user) return;
    
    const rolePath = user.role.toLowerCase();
    router.push(`/${rolePath}/notifications`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mobile Trigger: Direct Link to notifications page */}
      <Link
        href={`/${user?.role?.toLowerCase() || 'patient'}/notifications`}
        className="md:hidden relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer group flex items-center justify-center"
      >
        <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Desktop Trigger: Toggle popover dropdown */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:block relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer group"
      >
        <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[32rem] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{t('title')}</h3>
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  void markAllAsRead();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={t('markAllAsRead')}
              >
                <Check className="w-4 h-4" />
                {t('markAllAsRead')}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
            <NotificationList 
              notifications={notifications} 
              markAsRead={markAsRead} 
              isLoading={loading}
              maxItems={5}
            />
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={handleViewAll}
                className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer w-full py-1 hover:underline"
              >
                {t('viewAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
