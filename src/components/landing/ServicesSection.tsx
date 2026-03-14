'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRight as ArrowRightIcon,
  Clock as ClockIcon,
  Stethoscope as StethoscopeIcon,
  Heartbeat as HeartbeatIcon,
  Baby as BabyIcon,
} from '@phosphor-icons/react';

export function Services() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 bg-[#F8FAFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('services.title')}</h2>
            <p className="text-slate-500 text-lg">{t('services.subtitle')}</p>
          </div>
          <Link href="/services" className="hidden md:flex items-center text-[#1392ec] font-bold gap-2 hover:gap-3 transition-all">
            {t('services.viewAll')} <ArrowRightIcon weight="bold" className="text-lg" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Dept 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#1392ec]/5 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1392ec]">
                <StethoscopeIcon weight="fill" className="text-2xl" />
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('services.badgePrimary')}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('services.general.name')}</h3>
            <p className="text-slate-500 mb-6 text-sm">{t('services.general.description')}</p>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1"><ClockIcon weight="bold" className="text-base" /> {t('services.general.duration')}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[#1392ec] font-bold">{t('services.general.price')}</span>
            </div>
          </div>
          {/* Dept 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#1392ec]/5 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                <HeartbeatIcon weight="fill" className="text-2xl" />
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('services.badgeSpecialty')}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('services.cardiology.name')}</h3>
            <p className="text-slate-500 mb-6 text-sm">{t('services.cardiology.description')}</p>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1"><ClockIcon weight="bold" className="text-base" /> {t('services.cardiology.duration')}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[#1392ec] font-bold">{t('services.cardiology.price')}</span>
            </div>
          </div>
          {/* Dept 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#1392ec]/5 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <BabyIcon weight="fill" className="text-2xl" />
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('services.badgeFamily')}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('services.pediatrics.name')}</h3>
            <p className="text-slate-500 mb-6 text-sm">{t('services.pediatrics.description')}</p>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1"><ClockIcon weight="bold" className="text-base" /> {t('services.pediatrics.duration')}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[#1392ec] font-bold">{t('services.pediatrics.price')}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/services" className="inline-flex items-center text-[#1392ec] font-bold gap-2">
            {t('services.viewAll')} <ArrowRightIcon weight="bold" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
