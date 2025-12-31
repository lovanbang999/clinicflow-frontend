'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  const t = useTranslations('landing.cta');

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="">
        <div className="relative overflow-hidden bg-white px-6 py-12 sm:px-12 sm:py-14">
          {/* Soft clinic background wash */}
          <div className="pointer-events-none absolute inset-0">
            {/* subtle gradient wash */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(16,185,129,0.08),rgba(255,255,255,0))]" />
            {/* soft highlights */}
            <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
            {/* slight inner vignette */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              {t('title')}
            </h2>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
              {t('subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  {t('button')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
