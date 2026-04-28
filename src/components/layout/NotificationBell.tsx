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
        <div className="absolute right-0 mt-3 w-80 lg:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50 z-50 overflow-hidden flex flex-col max-h-[35rem] animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">{t('title')}</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {unreadCount} {t('new') || 'mới'}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  void markAllAsRead();
                }}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold flex items-center gap-1.5 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1.5 rounded-lg cursor-pointer"
                title={t('markAllAsRead')}
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                {t('markAllAsRead')}
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="overflow-y-auto flex-1 overscroll-contain custom-scrollbar min-h-[100px]">
            <NotificationList 
              notifications={notifications} 
              markAsRead={markAsRead} 
              isLoading={loading}
              maxItems={6}
              variant="popup"
            />
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100/50 dark:border-slate-800/50">
              <button 
                onClick={handleViewAll}
                className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer w-full py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
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
