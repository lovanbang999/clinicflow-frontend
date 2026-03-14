'use client';

import { useTranslations } from 'next-intl';
import {
  Stethoscope as StethoscopeIcon,
  ShieldCheck as ShieldCheckIcon,
  Clock as ClockIcon,
} from '@phosphor-icons/react';

export function Features() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('features.title')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t('features.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 p-8 rounded-3xl group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-slate-100">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-[#1392ec] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
              <StethoscopeIcon weight="fill" className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('features.professional.title')}</h3>
            <p className="text-slate-500 leading-relaxed">{t('features.professional.description')}</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-slate-100">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-[#1392ec] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheckIcon weight="fill" className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('features.safety.title')}</h3>
            <p className="text-slate-500 leading-relaxed">{t('features.safety.description')}</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-slate-100">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-[#1392ec] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
              <ClockIcon weight="fill" className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('features.scheduling.title')}</h3>
            <p className="text-slate-500 leading-relaxed">{t('features.scheduling.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
