'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  PhoneIcon,
  MapPinIcon,
} from '@phosphor-icons/react';

export function ContactInfo() {
  const t = useTranslations('landing');
  const locale = useLocale();

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
                <span>
                  {locale === 'vi' 
                    ? '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội' 
                    : '175 Tay Son, Trung Liet, Dong Da, Hanoi'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Interactive Google Maps Embed with Premium Styling pointing to Thuyloi University */}
          <div className="md:col-span-2 h-80 bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-xs relative group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6366089330686!2d105.8236761153321!3d21.00703839389279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac800f4581f1%3A0x6d90d8a9e0f3b23e!2sTr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+Th%E1%BB%A7y+L%E1%BB%A3i!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
            />
            
            {/* Get Directions Overlay Button */}
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=21.007038,105.823676"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-800 hover:text-[#1392ec] px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 border border-slate-100 hover:border-slate-200 cursor-pointer active:scale-95 z-10"
            >
              <MapPinIcon weight="bold" className="text-sm text-[#1392ec]" />
              {locale === 'vi' ? 'Chỉ đường' : 'Directions'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

