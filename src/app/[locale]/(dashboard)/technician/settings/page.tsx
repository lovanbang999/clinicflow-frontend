'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { AccountProfileTab } from '@/components/technician/settings/AccountProfileTab';
import { SecurityTab } from '@/components/technician/settings/SecurityTab';

export default function TechnicianSettingsPage() {
  const t = useTranslations('dashboard.technician.settingsContent');

  return (
    <div className="p-8 mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-[#1392ec]" />
            {t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:max-w-md h-auto p-1 bg-slate-100 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
          <TabsTrigger 
            value="account" 
            className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-[#1392ec] data-[state=active]:shadow-md transition-all flex items-center gap-2 cursor-pointer font-semibold"
          >
            <UserCircle className="w-4 h-4" />
            <span>{t('tabs.account')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md transition-all flex items-center gap-2 cursor-pointer font-semibold"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('tabs.security')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Profile Content */}
        <TabsContent value="account" className="animate-in fade-in zoom-in-95 duration-500">
          <AccountProfileTab />
        </TabsContent>

        {/* Security / Password Content */}
        <TabsContent value="security" className="animate-in fade-in zoom-in-95 duration-500">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
