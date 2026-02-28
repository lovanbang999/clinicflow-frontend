'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import Image from 'next/image';

export function LandingNavbar() {
  const tLanding = useTranslations('landing');
  const pathname = usePathname();

  console.log('pathname: ', pathname);

  const navLinks = [
    { href: '/services', label: tLanding('navbar.findCare') },
    { href: '/doctors', label: tLanding('navbar.doctors') },
    { href: '/about', label: tLanding('navbar.about') },
  ];

  // Strip locale prefix (/en, /vi, ...) before comparing
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const isActive = (href: string) =>
    pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/');

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/20 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="font-bold text-2xl tracking-tight text-slate-900">Smart Clinic</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative text-sm font-semibold transition-colors pb-1 ${
                  isActive(href)
                    ? 'text-[#1392ec]'
                    : 'text-slate-600 hover:text-[#1392ec]'
                }`}
              >
                {label}
                {/* Active underline indicator */}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1392ec] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-[#1392ec] transition-colors">
              {tLanding('navbar.login')}
            </Link>
            <Link href="/register">
              <button className="bg-[#1392ec] hover:bg-[#0d7cd1] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-xl shadow-[#1392ec]/20 active:scale-95 cursor-pointer">
                {tLanding('navbar.register')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
