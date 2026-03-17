'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { WarningCircleIcon, ArrowLeftIcon } from '@phosphor-icons/react';

export default function AdminNotFound() {
  const t = useTranslations('dashboard.admin.notFound');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center border border-[#e5e7eb] shadow-sm flex flex-col items-center">
        <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <WarningCircleIcon size={48} weight="fill" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#111518] mb-3">404</h1>
        <h2 className="text-xl font-bold text-[#111518] mb-2">{t('title')}</h2>
        <p className="text-[#64748b] text-sm mb-8 leading-relaxed">
          {t('description')}
        </p>

        <Link
          href="/receptionist"
          className="flex items-center gap-2 justify-center w-full px-6 py-3 bg-[#1392ec] text-white rounded-xl text-sm font-bold hover:bg-[#1180d0] transition-all shadow-md shadow-[#1392ec]/20"
        >
          <ArrowLeftIcon size={18} weight="bold" />
          {t('backToDashboard')}
        </Link>
      </div>
    </div>
  );
}
