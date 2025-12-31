'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export function LandingNavbar() {
  const tLanding = useTranslations('landing');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <Image
                src="/logo.svg"
                alt="Smart Clinic"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-slate-900">Smart Clinic</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/services"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {tLanding('navbar.services')}
            </Link>
            <Link
              href="/#features"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {tLanding('navbar.doctors')}
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {tLanding('navbar.contact')}
            </Link>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex cursor-pointer">
                {tLanding('navbar.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                {tLanding('navbar.register')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
