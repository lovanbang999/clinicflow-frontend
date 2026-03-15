'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShareNetworkIcon, CameraIcon, AtIcon } from '@phosphor-icons/react';
import Image from 'next/image';

export function LandingFooter() {
  const t = useTranslations('landing.footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1117] text-slate-400 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#1392ec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1392ec]/20">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">Smart Clinic</span>
            </div>
            <p className="max-w-xs mb-10 text-lg leading-relaxed">
              {t('tagline')}
            </p>
            <div className="flex gap-6">
              {[ShareNetworkIcon, CameraIcon, AtIcon].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center hover:bg-[#1392ec]/10 hover:border-[#1392ec] transition-all"
                >
                  <Icon weight="bold" className="text-xl" />
                </a>
              ))}
            </div>
          </div>

          {/* Patients Column */}
          <div>
            <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">
              {t('patients')}
            </h5>
            <ul className="space-y-6 text-sm font-medium">
              <li><Link href="/doctors" className="hover:text-white transition-colors">{t('findDoctor')}</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">{t('bookAppointment')}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('patientPortal')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('insurance')}</a></li>
            </ul>
          </div>

          {/* About Us Column */}
          <div>
            <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">
              {t('aboutUs')}
            </h5>
            <ul className="space-y-6 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">{t('ourStory')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('careers')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('press')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('contact')}</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">
              {t('legal')}
            </h5>
            <ul className="space-y-6 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('termsOfService')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('hipaaCompliance')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('cookiePolicy')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-medium">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
