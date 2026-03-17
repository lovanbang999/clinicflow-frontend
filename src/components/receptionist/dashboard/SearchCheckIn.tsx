'use client';

import { useTranslations } from 'next-intl';
import { MagnifyingGlass as MagnifyingGlassIcon, UserCircle as UserCircleIcon } from '@phosphor-icons/react';

export function SearchCheckIn() {
  const t = useTranslations('dashboard.receptionist.searchCheckIn');

  return (
    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-blue-600 transition-colors">
        <MagnifyingGlassIcon className="text-slate-400 h-5 w-5" weight="bold" />
        <h3 className="font-bold text-slate-900">{t('title')}</h3>
      </div>
      
      <div className="relative mb-8">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input 
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 transition-shadow outline-none cursor-text" 
          placeholder={t('placeholder')} 
          type="text"
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center cursor-pointer group">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors">
          <UserCircleIcon className="text-slate-200 h-16 w-16" weight="duotone" />
        </div>
        <p className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">{t('emptyState')}</p>
      </div>
    </div>
  );
}
