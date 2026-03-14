'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function CTA() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#1392ec] to-[#0055DD] shadow-2xl shadow-blue-900/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="relative z-10 py-20 text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('cta.title')}</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">{t('cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="group w-full sm:w-auto bg-white text-[#1392ec] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer">
                {t('cta.button')}
              </button>
            </Link>
            <Link href="/services">
              <button className="group w-full sm:w-auto bg-[#0d7cd1]/30 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-[#0d7cd1]/50 cursor-pointer">
                {t('cta.secondaryButton')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
