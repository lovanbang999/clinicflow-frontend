import { getTranslations } from 'next-intl/server';
import { TechnicianStatsGrid } from '@/components/technician/TechnicianStatsGrid';
import Link from 'next/link';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

export default async function TechnicianDashboardPage() {
  const t = await getTranslations('technicianWorklist');

  return (
    <div className="space-y-8 pb-10 p-8 mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard')}</h1>
        <p className="text-gray-500">
          {t('statsSubtitle')}
        </p>
      </div>

      <TechnicianStatsGrid />

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('labWorklist')}</h2>
          <p className="text-gray-500">
            {t('worklistSubtitle')}
          </p>
        </div>
        <Link 
          href="/technician/lab-worklist"
          className="flex items-center gap-2 bg-[#1392ec] hover:bg-[#107ac7] text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer"
        >
          {t('goToWorklist')}
          <ArrowRightIcon weight="bold" />
        </Link>
      </div>
    </div>
  );
}
