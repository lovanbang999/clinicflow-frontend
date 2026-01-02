'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles } from 'lucide-react';

export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>{t('subtitle')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            {t('title')}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-medium cursor-pointer">
                <Calendar className="w-5 h-5 mr-2" />
                {t('cta')}
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium cursor-pointer">
                {t('viewServices')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">1000+</div>
              <div className="text-sm text-slate-600">{t('patient')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">50+</div>
              <div className="text-sm text-slate-600">{t('doctor')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-sm text-slate-600">{t('support')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
