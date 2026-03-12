'use client';

import { useTranslations } from 'next-intl';
import { Stethoscope, ShieldCheck, Clock } from '@phosphor-icons/react';

const features = [
  {
    key: 'professional',
    icon: Stethoscope,
  },
  {
    key: 'safety',
    icon: ShieldCheck,
  },
  {
    key: 'scheduling',
    icon: Clock,
  },
] as const;

export function Features() {
  const t = useTranslations('landing.features');

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('title')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t('subtitle')}</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="bg-slate-50 p-8 rounded-3xl group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-slate-100"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-[#1392ec] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                <feature.icon weight="regular" className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {t(`${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
