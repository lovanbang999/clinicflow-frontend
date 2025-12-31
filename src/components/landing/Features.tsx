'use client';

import { useTranslations } from 'next-intl';
import { Bot, Zap, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const featureIcons = {
  ai: Bot,
  quick: Zap,
  notification: Bell,
};

export function Features() {
  const t = useTranslations('landing.features');

  const features = [
    {
      key: 'ai',
      icon: featureIcons.ai,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      key: 'quick',
      icon: featureIcons.quick,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      key: 'notification',
      icon: featureIcons.notification,
      color: 'bg-blue-100 text-blue-600',
    },
  ] as const;

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t('title')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.key}
                className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {t(`${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
