'use client';

import { useTranslations } from 'next-intl';
import { TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react';

export function CheckInStats() {
  const t = useTranslations('dashboard.receptionist.checkInManagement.stats');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <p className="text-slate-500 text-sm font-medium">{t('pending')}</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">12</span>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center mb-0.5">
                    <TrendUpIcon size={14} className="mr-0.5" /> 2%
                </span>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <p className="text-slate-500 text-sm font-medium">{t('confirmed')}</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">28</span>
                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center mb-0.5">
                    <TrendUpIcon size={14} className="mr-0.5" /> 5%
                </span>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <p className="text-slate-500 text-sm font-medium">{t('completed')}</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">15</span>
                <span className="text-rose-600 text-xs font-bold bg-rose-50 px-1.5 py-0.5 rounded flex items-center mb-0.5">
                    <TrendDownIcon size={14} className="mr-0.5" /> 1%
                </span>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <p className="text-slate-500 text-sm font-medium">{t('cancelled')}</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">3</span>
                <span className="text-slate-400 text-xs font-bold bg-slate-50 px-1.5 py-0.5 rounded flex items-center mb-0.5">0%</span>
            </div>
        </div>
    </div>
  );
}
