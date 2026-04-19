'use client';

import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { InAppNotification } from '@/lib/api/clinic/notifications';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: InAppNotification[];
  markAsRead: (id: string) => void;
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function NotificationList({ 
  notifications, 
  markAsRead, 
  isLoading, 
  className,
  maxItems 
}: NotificationListProps) {
  const currentLocale = useLocale();
  const t = useTranslations('common.notifications');

  const getIconColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED': return 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      case 'APPOINTMENT_REMINDER': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
      case 'BOOKING_CANCELLED': return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
      case 'LAB_RESULT_READY': return 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
      case 'INVOICE_ISSUED': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const displayedNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col divide-y divide-slate-100 dark:divide-slate-800/50", className)}>
      {displayedNotifications.map((notif) => (
        <button
          key={notif.id}
          id={`notification-item-${notif.id}`}
          onClick={() => !notif.isRead && markAsRead(notif.id)}
          className={cn(
            "w-full text-left p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200 flex gap-4 group",
            !notif.isRead ? "bg-blue-50/40 dark:bg-blue-900/10 shadow-sm z-10" : "bg-transparent"
          )}
        >
          <div className={cn(
            "mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-200",
            getIconColor(notif.type)
          )}>
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1 gap-2">
              <p className={cn(
                "text-sm line-clamp-1 pr-1",
                !notif.isRead ? "font-bold text-slate-900 dark:text-slate-100" : "font-semibold text-slate-700 dark:text-slate-300"
              )}>
                {notif.title}
              </p>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 font-medium">
                {(() => {
                  try {
                    const date = new Date(notif.createdAt);
                    if (isNaN(date.getTime())) return '';
                    return formatDistanceToNow(date, { 
                      addSuffix: true, 
                      locale: currentLocale === 'vi' ? vi : enUS 
                    });
                  } catch {
                    return '';
                  }
                })()}
              </span>
            </div>
            <p className={cn(
              "text-xs leading-relaxed",
              !notif.isRead ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-500 dark:text-slate-400"
            )}>
              {notif.content}
            </p>
          </div>
          {!notif.isRead && (
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
