'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function LandingFooter() {
  const t = useTranslations('landing.footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <Image
                src="/logo.svg"
                alt="Smart Clinic"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">Smart Clinic</span>
          </Link>

          {/* Tagline */}
          <p className="text-slate-400 mb-8 max-w-md">
            {t('tagline')}
          </p>

          {/* Copyright */}
          <div className="pt-8 border-t border-slate-800 w-full">
            <p className="text-sm text-slate-500">
              {t('copyright', { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
