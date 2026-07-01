'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LucideIcon } from 'lucide-react';
import { Service } from '@/types/service';
import { resolveMediaUrl } from '@/lib/utils/media-url';

interface ServiceCardProps {
  service: Service;
  icon: LucideIcon;
  color: string;
}

export function ServiceCard({ service, icon: Icon, color }: ServiceCardProps) {
  const t = useTranslations('services');
  const serviceImageSrc = resolveMediaUrl(service.iconUrl);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[16px] border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <div className={`w-14 h-14 bg-linear-to-br ${color} rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform overflow-hidden shadow-sm`}>
        {serviceImageSrc ? (
          <Image
            src={serviceImageSrc}
            alt={service.name}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon className="h-7 w-7 text-white" />
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
        {service.name}
      </h3>

      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
        {service.description || 'Dịch vụ chất lượng cao'}
      </p>

      <div className="space-y-4 mb-8 border-t border-slate-50 dark:border-slate-700/50 pt-6 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
            <span className="material-symbols-outlined text-[20px] text-slate-400">
              schedule
            </span>
            <span className="text-sm">{t('labels.duration')}:</span>
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {service.durationMinutes} phút
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
            <span className="material-symbols-outlined text-[20px] text-slate-400">
              payments
            </span>
            <span className="text-sm">{t('labels.price')}:</span>
          </div>
          <span className="font-bold text-blue-600 text-base">
            {service.price.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Link href={`/services/${service.id}`} className="block">
          <button className="w-full h-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">
            {t('actions.viewService')}
          </button>
        </Link>
        <Link href={`/register`} className="block">
          <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-slate-900/10 active:scale-95 cursor-pointer whitespace-nowrap">
            {t('actions.bookNow')}
          </button>
        </Link>
      </div>
    </div>
  );
}
