'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  CalendarClock, 
  BellRing, 
  ShieldAlert, 
  LayoutDashboard,
  Save
} from 'lucide-react';
import { ClinicProfileTab } from '@/components/admin/settings/ClinicProfileTab';
import { BookingRulesTab } from '@/components/admin/settings/BookingRulesTab';
import { NotificationsTab } from '@/components/admin/settings/NotificationsTab';
import { SecurityTab } from '@/components/admin/settings/SecurityTab';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminSettings } from '@/lib/hooks/useAdminSettings';

export default function AdminSystemConfigPage() {
  const t = useTranslations('adminSettings');
  const { 
    settings, 
    loading, 
    saving, 
    updateClinicProfile, 
    updateBookingRules, 
    updateNotifications 
  } = useAdminSettings();

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-md rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-8 mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            {t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="clinic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:max-w-3xl h-auto p-1 bg-slate-100 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
          <TabsTrigger 
            value="clinic" 
            className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('clinicProfile')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="booking" 
            className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CalendarClock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('bookingRules')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span className="hidden sm:inline">{t('notifications')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-slate-600 data-[state=active]:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">{t('security')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="animate-in fade-in zoom-in-95 duration-500">
          <ClinicProfileTab 
            data={settings.clinic} 
            onSave={updateClinicProfile} 
            loading={saving} 
          />
        </TabsContent>

        <TabsContent value="booking" className="animate-in fade-in zoom-in-95 duration-500">
          <BookingRulesTab 
            data={settings.booking} 
            onSave={updateBookingRules} 
            loading={saving} 
          />
        </TabsContent>

        <TabsContent value="notifications" className="animate-in fade-in zoom-in-95 duration-500">
          <NotificationsTab 
            data={settings.notification} 
            onSave={updateNotifications} 
            loading={saving} 
          />
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in zoom-in-95 duration-500">
          <SecurityTab />
        </TabsContent>
      </Tabs>
      
      {/* Aesthetic Footer Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4 opacity-50">
        <Save className="w-3 h-3" />
        <span>{t('securityNoticeDesc')}</span>
      </div>
    </div>
  );
}
