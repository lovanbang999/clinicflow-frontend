'use client';

import {
  SealCheckIcon,
  ArrowRightIcon,
  PhoneIcon,
  UsersIcon,
  CheckCircleIcon,
  StarIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarBlankIcon
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <header className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-white to-[#F0F7FF]">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[50rem] h-[50rem] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40rem] h-[40rem] bg-indigo-50/60 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Two-column Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-left relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1392ec] text-sm font-bold tracking-wide mb-8">
              <SealCheckIcon weight="fill" className="text-base mr-2" />
              {t('badge')}
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              {t('titleLine1')}<br />
              <span className="text-gradient-landing">{t('titleLine2')}</span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-lg text-slate-600 mb-10 font-medium leading-relaxed">
              {t('description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/register">
                <button className="bg-[#1392ec] hover:bg-[#0d7cd1] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#1392ec]/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                  {t('cta')}
                  <ArrowRightIcon weight="bold" className="text-sm" />
                </button>
              </Link>
              <a href="tel:8001234567">
                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                  <PhoneIcon weight="fill" className="text-[#1392ec] text-xl" />
                  {t('phone')}
                </button>
              </a>
            </div>

            {/* Doctor Avatars */}
            <div className="flex items-center gap-8 pt-8 border-t border-slate-200/60">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden"
                  >
                    <UsersIcon weight="fill" className="text-white text-lg" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  +2k
                </div>
              </div>
              <div className="text-sm font-medium text-slate-500">
                <span className="block text-slate-900 font-bold text-base">{t('doctorCount')}</span>
                {t('doctorSubtext')}
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative lg:h-[600px] w-full hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-white rounded-[40px] rotate-3 opacity-50" />

            {/* Clinic image */}
            <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10">
              <Image
                src="/landing-page/unnamed.png"
                alt="Modern Medical Clinic Interior"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-blue-900/5 rounded-[40px] pointer-events-none" />

            {/* Floating badge: Clinic Open */}
            <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircleIcon weight="fill" className="text-2xl" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">{t('statusLabel')}</p>
                <p className="text-sm font-bold text-slate-800">{t('statusValue')}</p>
              </div>
            </div>

            {/* Floating badge: Rating */}
            <div className="absolute bottom-20 -right-6 bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <StarIcon weight="fill" className="text-amber-400 text-lg" />
                <span className="text-sm font-bold text-slate-800">{t('rating')}</span>
              </div>
              <p className="text-xs text-slate-500">{t('ratingQuote')}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#1392ec]/10 to-blue-400/10 rounded-[24px] blur-md" />
          <div className="relative bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
            <form className="flex flex-col md:flex-row items-center gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="flex-1 w-full relative group">
                <MagnifyingGlassIcon weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1392ec] text-xl" />
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-base"
                  placeholder={t('searchPlaceholder')}
                  type="text"
                />
              </div>
              <div className="flex-1 w-full relative group">
                <MapPinIcon weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1392ec] text-xl" />
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-base"
                  placeholder={t('locationPlaceholder')}
                  type="text"
                />
              </div>
              <div className="flex-1 w-full relative group">
                <CalendarBlankIcon weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1392ec] text-xl" />
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 text-base"
                  placeholder={t('datePlaceholder')}
                  type="text"
                />
              </div>
              <div className="p-2 w-full md:w-auto">
                <Link href="/doctors">
                  <button
                    type="button"
                    className="w-full md:w-auto bg-[#1392ec] hover:bg-[#0d7cd1] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-[#1392ec]/20 whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    {t('searchBtn')}
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto border-t border-slate-100 pt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">24/7</div>
            <div className="text-sm text-slate-500 font-medium">{t('stat1')}</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">100+</div>
            <div className="text-sm text-slate-500 font-medium">{t('stat2')}</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">500+</div>
            <div className="text-sm text-slate-500 font-medium">{t('stat3')}</div>
          </div>
          <div className="text-center border-l border-slate-100">
            <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">15m</div>
            <div className="text-sm text-slate-500 font-medium">{t('stat4')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
