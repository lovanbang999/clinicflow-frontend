'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, LucideIcon } from 'lucide-react';
import { Service } from '@/types/service';

interface ServiceCardProps {
  service: Service;
  icon: LucideIcon;
  color: string;
}

export function ServiceCard({ service, icon: Icon, color }: ServiceCardProps) {
  const t = useTranslations('services');

  return (
    <Card className="group h-full border-slate-200 transition-all hover:border-blue-300 hover:shadow-lg">
      <CardContent className="flex h-full flex-col py-2">
        {/* Top */}
        <div>
          {/* Icon */}
          <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden bg-linear-to-br ${color}`}>
            {service.iconUrl ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${service.iconUrl}`}
                alt={service.name}
                width={28}
                height={28}
                className="object-contain"
              />
            ) : (
              <Icon className="h-7 w-7 text-white" />
            )}
          </div>

          {/* Name */}
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            {service.name}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {service.description || 'Dịch vụ chất lượng cao'}
          </p>

          {/* Info */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{t('labels.duration')}:</span>
              <span className="font-medium text-slate-700">
                {service.durationMinutes} phút
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span>{t('labels.price')}:</span>
              <span className="text-lg font-semibold text-blue-600">
                {service.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        {/* CTA bottom */}
        <div className="mt-auto pt-6">
          <Link href="/register" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
              {t('actions.bookNow')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
