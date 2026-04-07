'use client';

import { useTranslations } from 'next-intl';
import { DoctorAnalyticsPanel } from '@/components/analytics/DoctorAnalyticsPanel';

export default function DoctorAnalyticsPage() {
  const t = useTranslations('doctorWorkspace');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('analyticsTitle') || 'Thống kê'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t('analyticsDesc') || 'Thống kê hoạt động khám bệnh của bạn'}
        </p>
      </div>

      <DoctorAnalyticsPanel />
    </div>
  );

}
