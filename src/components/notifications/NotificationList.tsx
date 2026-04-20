import {
  Bell,
  CalendarCheck,
  CalendarX,
  Clock,
  FlaskConical,
  FileText,
  Settings,
  ShieldAlert
} from 'lucide-react';
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

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return {
          icon: CalendarCheck,
          color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
        };
      case 'APPOINTMENT_REMINDER':
        return {
          icon: Clock,
          color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
        };
      case 'BOOKING_CANCELLED':
        return {
          icon: CalendarX,
          color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
        };
      case 'LAB_RESULT_READY':
        return {
          icon: FlaskConical,
          color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'
        };
      case 'INVOICE_ISSUED':
        return {
          icon: FileText,
          color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
        };
      case 'SYSTEM':
        return {
          icon: Settings,
          color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        };
      case 'ADMIN_ACTIVITY':
        return {
          icon: ShieldAlert,
          color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
        };
      default:
        return {
          icon: Bell,
          color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        };
    }
  };

  const displayedNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[240px]">
        <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-900 dark:text-slate-100 text-base font-bold mb-1">{t('empty')}</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('emptyDesc') || 'Tất cả đã ổn! Bạn không có thông báo nào mới.'}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {displayedNotifications.map((notif) => {
        const config = getNotificationConfig(notif.type);
        const Icon = config.icon;

        return (
          <button
            key={notif.id}
            id={`notification-item-${notif.id}`}
            onClick={() => !notif.isRead && markAsRead(notif.id)}
            className={cn(
              "w-full text-left p-4 transition-all duration-300 flex gap-4 group relative overflow-hidden border-b border-slate-50 dark:border-slate-800/50",
              !notif.isRead
                ? "bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)] z-10 cursor-pointer rounded-2xl "
                : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            )}
          >
            <div className={cn(
              "mt-0.5 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110",
              !notif.isRead
                ? "shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-200/50 dark:border-blue-500/30"
                : "shadow-sm border-white/50 dark:border-slate-700/30",
              config.color
            )}>
              <Icon className={cn("w-5 h-5", !notif.isRead && "animate-pulse-subtle")} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1 gap-2">
                <p className={cn(
                  "text-[14px] leading-tight pr-1 transition-colors",
                  !notif.isRead ? "font-extrabold text-blue-600 dark:text-blue-400" : "font-semibold text-slate-600 dark:text-slate-400"
                )}>
                  {notif.title}
                </p>
                <span className={cn(
                  "text-[10px] whitespace-nowrap shrink-0 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  !notif.isRead
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500"
                )}>
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
                "text-xs leading-relaxed line-clamp-2",
                !notif.isRead ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-500 dark:text-slate-500 font-normal"
              )}>
                {notif.content}
              </p>
            </div>

            {!notif.isRead && (
              <div className="flex flex-col items-center justify-center shrink-0 gap-1 ml-1">
                <div className={cn(
                  "w-3 h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse bg-blue-500 border-2 border-white dark:border-slate-900"
                )} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
