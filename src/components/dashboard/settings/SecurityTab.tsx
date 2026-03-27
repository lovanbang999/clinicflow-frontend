'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { ShieldAlert, Rocket } from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const t = useTranslations('dashboard.admin.settings');

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ShieldAlert className="w-64 h-64 -mr-16 -mt-16 rotate-12" />
        </div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-8 bg-slate-500 rounded-full" />
            {t('security')}
          </CardTitle>
          <CardDescription>
            {t('securityDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4 relative z-10">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
            <Rocket className="w-12 h-12 text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {t('upcomingFeature')}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {t('upcomingFeatureDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
