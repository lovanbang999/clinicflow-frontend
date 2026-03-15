'use client';

import { useTranslations } from 'next-intl';
import {
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
} from '@phosphor-icons/react';

export function ContactInfo() {
  const t = useTranslations('landing');

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest mb-4">{t('contactInfo.openingHours')}</h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>{t('contactInfo.monFri')} <span className="text-slate-900">08:00 - 17:00</span></li>
                <li>{t('contactInfo.saturday')} <span className="text-slate-900">08:00 - 12:00</span></li>
                <li>{t('contactInfo.sunday')} <span className="text-red-500">{t('contactInfo.closed')}</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest mb-4">{t('contactInfo.directContact')}</h4>
              <div className="flex items-center gap-3 text-slate-600 mb-2">
                <PhoneIcon weight="fill" className="text-[#1392ec]" />
                <span>+84 912 345 678</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPinIcon weight="fill" className="text-[#1392ec]" />
                <span>123 ABC Street, Hanoi, Vietnam</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 h-80 bg-slate-100 rounded-3xl relative overflow-hidden group border border-slate-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPinIcon weight="fill" className="text-6xl text-slate-300" />
            </div>
            <div className="absolute inset-0 bg-[#1392ec]/5 group-hover:bg-transparent transition-colors cursor-pointer"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
