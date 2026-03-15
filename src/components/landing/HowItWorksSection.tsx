'use client';

import { useTranslations } from 'next-intl';

export function HowItWorks() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('howItWorks.title')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">{t('howItWorks.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1392ec] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
            <h4 className="font-bold text-lg mb-2">{t('howItWorks.steps.step1.title')}</h4>
            <p className="text-sm text-slate-500">{t('howItWorks.steps.step1.desc')}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-[#1392ec] text-[#1392ec] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
            <h4 className="font-bold text-lg mb-2">{t('howItWorks.steps.step2.title')}</h4>
            <p className="text-sm text-slate-500">{t('howItWorks.steps.step2.desc')}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-[#1392ec] text-[#1392ec] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
            <h4 className="font-bold text-lg mb-2">{t('howItWorks.steps.step3.title')}</h4>
            <p className="text-sm text-slate-500">{t('howItWorks.steps.step3.desc')}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-[#1392ec] text-[#1392ec] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">4</div>
            <h4 className="font-bold text-lg mb-2">{t('howItWorks.steps.step4.title')}</h4>
            <p className="text-sm text-slate-500">{t('howItWorks.steps.step4.desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
