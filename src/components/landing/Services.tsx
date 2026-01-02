'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Heart, Droplet, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

const serviceIcons = {
  general: Stethoscope,
  cardiology: Heart,
  dermatology: Droplet,
};

const serviceColors = {
  general: 'from-blue-500 to-cyan-500',
  cardiology: 'from-red-500 to-pink-500',
  dermatology: 'from-teal-500 to-emerald-500',
};

export function Services() {
  const t = useTranslations('landing.services');

  const services = [
    { key: 'general', icon: serviceIcons.general, color: serviceColors.general },
    { key: 'cardiology', icon: serviceIcons.cardiology, color: serviceColors.cardiology },
    { key: 'dermatology', icon: serviceIcons.dermatology, color: serviceColors.dermatology },
  ] as const;

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-14">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('title')}
          </h2>
          <Link href="/services" className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="group gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t('viewAll')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.key}
                className="group border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <CardContent className="">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br ${service.color} mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {t(`${service.key}.name`)}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {t(`${service.key}.description`)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-lg font-bold text-blue-600">
                      {t(`${service.key}.price`)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {t(`${service.key}.duration`)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
