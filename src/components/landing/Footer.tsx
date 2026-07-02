'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ShareNetworkIcon, CameraIcon, AtIcon } from '@phosphor-icons/react';
import Image from 'next/image';

const socialIcons = [
  { Icon: ShareNetworkIcon, label: 'Social media' },
  { Icon: CameraIcon, label: 'Photo gallery' },
  { Icon: AtIcon, label: 'Email updates' },
];

const disabledFooterLinkClass = 'text-slate-600 cursor-not-allowed';

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
              {socialIcons.map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  disabled
                  className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-600"
                >
                  <Icon weight="bold" className="text-xl" />
                </button>
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
              <li><Link href="/login" className="hover:text-white transition-colors">{t('patientPortal')}</Link></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('insurance')}</span></li>
            </ul>
          </div>

          {/* About Us Column */}
          <div>
            <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">
              {t('aboutUs')}
            </h5>
            <ul className="space-y-6 text-sm font-medium">
              <li><Link href="/about" className="hover:text-white transition-colors">{t('ourStory')}</Link></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('careers')}</span></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('press')}</span></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('contact')}</span></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">
              {t('legal')}
            </h5>
            <ul className="space-y-6 text-sm font-medium">
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('privacyPolicy')}</span></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('termsOfService')}</span></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('hipaaCompliance')}</span></li>
              <li><span aria-disabled="true" className={disabledFooterLinkClass}>{t('cookiePolicy')}</span></li>
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
