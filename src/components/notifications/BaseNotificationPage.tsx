'use client';

import { Check, Bell, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/clinic/useNotifications';
import { NotificationList } from './NotificationList';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';

interface BaseNotificationPageProps {
  role: string;
  dashboardPath: string;
}

export function BaseNotificationPage({ role, dashboardPath }: BaseNotificationPageProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const t = useTranslations('common.notifications');
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header section with breadcrumbs logic */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t('back')}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {unreadCount > 0 
                  ? t('unreadCount', { count: unreadCount }) 
                  : t('noUnread')
                }
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsRead()}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold h-10 px-4 transition-all"
          >
            <Check className="w-4 h-4 text-blue-600" />
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden backdrop-blur-xl">
        <NotificationList 
          notifications={notifications} 
          markAsRead={markAsRead} 
          isLoading={loading}
          className="divide-y-0 gap-1.5 p-2"
        />
      </div>
    </div>
  );
}
