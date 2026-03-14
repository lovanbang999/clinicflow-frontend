'use client';

import { useTranslations } from 'next-intl';
import { 
  HeartbeatIcon, 
  LightbulbIcon, 
  HandshakeIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import Image from 'next/image';

export function AboutPageContent() {
  const t = useTranslations('landing.about');
  const tHero = useTranslations('landing.hero');

  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="relative pt-16 md:pt-20 pb-16 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F0F7FF] to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[10%] w-[50rem] h-[50rem] bg-blue-100/40 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-blue-900/5 z-10"></div>
              <Image 
                src="/images/about-medical-team.png" 
                alt="Smart Clinic Medical Team" 
                className="absolute inset-0 w-full h-full object-cover"
                fill
                priority
              />
            </div>
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                {t('story.title')}
              </h2>
              <div className="space-y-4 md:space-y-6 text-base sm:text-lg text-slate-600 leading-relaxed">
                <p>{t('story.p1')}</p>
                <p>{t('story.p2')}</p>
              </div>
              <div className="pt-2 md:pt-4">
                <div className="p-5 md:p-6 bg-blue-50 rounded-2xl md:rounded-3xl border border-blue-100">
                  <h3 className="text-[#1392ec] font-bold text-base md:text-lg mb-2 flex items-center gap-2">
                    <HeartbeatIcon weight="fill" className="text-lg md:text-xl" />
                    {t('mission.title')}
                  </h3>
                  <p className="text-slate-600 font-medium italic text-sm md:text-base">
                    &quot;{t('mission.desc')}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-slate-900 text-white rounded-[30px] md:rounded-[60px] mx-4 lg:mx-8 my-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1392ec]/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 md:mb-16">{t('stats.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1392ec]">{tHero('stat1Num')}</div>
              <div className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">{t('stats.doctors')}</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1392ec]">{tHero('stat2Num')}</div>
              <div className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">{t('stats.patients')}</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1392ec]">15k+</div>
              <div className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">{t('stats.appointments')}</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1392ec]">5+</div>
              <div className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">{t('stats.locations')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:text-center md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('values.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-8 md:p-10 bg-slate-50 rounded-[30px] md:rounded-[40px] border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-[#1392ec] shadow-sm group-hover:scale-110 transition-transform duration-300">
                <UsersIcon weight="fill" className="text-2xl md:text-3xl" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{t('values.v1.title')}</h3>
              <p className="text-slate-500 leading-relaxed text-base md:text-lg">{t('values.v1.desc')}</p>
            </div>
            <div className="p-8 md:p-10 bg-slate-50 rounded-[30px] md:rounded-[40px] border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-[#1392ec] shadow-sm group-hover:scale-110 transition-transform duration-300">
                <LightbulbIcon weight="fill" className="text-2xl md:text-3xl" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{t('values.v2.title')}</h3>
              <p className="text-slate-500 leading-relaxed text-base md:text-lg">{t('values.v2.desc')}</p>
            </div>
            <div className="p-8 md:p-10 bg-slate-50 rounded-[30px] md:rounded-[40px] border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mb-6 md:mb-8 text-[#1392ec] shadow-sm group-hover:scale-110 transition-transform duration-300">
                <HandshakeIcon weight="fill" className="text-2xl md:text-3xl" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">{t('values.v3.title')}</h3>
              <p className="text-slate-500 leading-relaxed text-base md:text-lg">{t('values.v3.desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
