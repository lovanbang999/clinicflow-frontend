'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import Image from 'next/image';
import { List, X } from '@phosphor-icons/react';

export function LandingNavbar() {
  const tLanding = useTranslations('landing');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: tLanding('navbar.home') },
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
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} className="w-8 h-8 md:w-10 md:h-10" />
            <span className="font-bold text-xl md:text-2xl tracking-tight text-slate-900">Smart Clinic</span>
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

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-[#1392ec] transition-colors">
              {tLanding('navbar.login')}
            </Link>
            <Link
              href="/register"
              className="bg-[#1392ec] hover:bg-[#0d7cd1] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-xl shadow-[#1392ec]/20 active:scale-95"
            >
              {tLanding('navbar.register')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-[#1392ec] transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive(href)
                    ? 'bg-[#1392ec]/10 text-[#1392ec]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1392ec]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          
          <div className="h-px bg-slate-100 my-2" />
          
          <div className="flex flex-col gap-3 px-4 pb-2">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center text-sm font-bold text-slate-700 hover:text-[#1392ec] transition-colors rounded-xl border border-slate-200 hover:border-[#1392ec]/30 hover:bg-[#1392ec]/5"
            >
              {tLanding('navbar.login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-[#1392ec] hover:bg-[#0d7cd1] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 text-center"
            >
              {tLanding('navbar.register')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
