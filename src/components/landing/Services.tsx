'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { HeartbeatIcon, BabyIcon, ArrowRightIcon, ClockIcon, FirstAidKitIcon } from '@phosphor-icons/react';

const departments = [
  {
    key: 'general',
    icon: FirstAidKitIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1392ec]',
    badgeKey: 'badgePrimary',
  },
  {
    key: 'cardiology',
    icon: HeartbeatIcon,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    badgeKey: 'badgeSpecialty',
  },
  {
    key: 'pediatrics',
    icon: BabyIcon,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    badgeKey: 'badgeFamily',
  },
] as const;

export function Services() {
  const t = useTranslations('landing.services');

  return (
    <section className="py-24 bg-[#F8FAFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('title')}</h2>
            <p className="text-slate-500 text-lg">{t('subtitle')}</p>
          </div>
          <Link
            href="/services"
            className="hidden md:flex items-center text-[#1392ec] font-bold gap-2 hover:gap-3 transition-all"
          >
            {t('viewAll')}
            <ArrowRightIcon weight="bold" className="text-lg" />
          </Link>
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <div
              key={dept.key}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#1392ec]/5 hover:-translate-y-1 cursor-pointer"
            >
              {/* Icon + Badge row */}
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 ${dept.iconBg} rounded-xl flex items-center justify-center ${dept.iconColor}`}>
                  <dept.icon weight="regular" className="text-2xl" />
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {t(dept.badgeKey)}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {t(`${dept.key}.name`)}
              </h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                {t(`${dept.key}.description`)}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                <span className="flex items-center gap-1">
                  <ClockIcon weight="fill" className="text-base" />
                  {t(`${dept.key}.duration`)}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-[#1392ec] font-bold">{t(`${dept.key}.price`)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile view all link */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/services" className="inline-flex items-center text-[#1392ec] font-bold gap-2">
            {t('viewAll')}
            <ArrowRightIcon weight="bold" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
