'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  CalendarPlusIcon,
  FilesIcon,
  PillIcon,
  ReceiptIcon,
} from '@phosphor-icons/react';
import { BotMessageSquare } from 'lucide-react';

export function QuickActionBar() {
  const t = useTranslations('patientOverview.quickActions');

  const actions = [
    {
      label: t('book'),
      href: '/patient/book',
      icon: <CalendarPlusIcon weight="fill" className="text-2xl mb-1" />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      label: t('records'),
      href: '/patient/medical-records',
      icon: <FilesIcon weight="fill" className="text-2xl mb-1" />,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    },
    {
      label: t('prescriptions'),
      href: '/patient/prescriptions',
      icon: <PillIcon weight="fill" className="text-2xl mb-1" />,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: t('billing'),
      href: '/patient/invoices',
      icon: <ReceiptIcon weight="fill" className="text-2xl mb-1" />,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    },
    {
      label: t('chat'),
      href: '/patient/chat',
      icon: <BotMessageSquare className="w-6 h-6 mb-1" strokeWidth={2.5} />,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    },
  ];

  return (
    <section className="grid grid-cols-5 gap-2 sm:gap-4 md:hidden">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          href={action.href}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${action.color}`}>
            {action.icon}
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
            {action.label}
          </span>
        </Link>
      ))}
    </section>
  );
}
