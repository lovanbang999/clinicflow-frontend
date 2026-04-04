'use client';

import { useTranslations } from 'next-intl';
import { useThemeStore } from '@/lib/store/themeStore';
import {
  MoonIcon,
  SunIcon,
  GlobeIcon,
} from '@phosphor-icons/react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export default function PatientSettingsPage() {
  const t = useTranslations('patientOverview');
  const { isDark, toggleDarkMode } = useThemeStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('settings')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Content Area */}
      <div className="w-full space-y-6">
        {/* Appearance Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">
            {t('appearance')}
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                  {isDark ? <MoonIcon size={20} className="md:w-6 md:h-6" weight="fill" /> : <SunIcon size={20} className="md:w-6 md:h-6" weight="fill" />}
                </div>
                <div className="flex-1 min-w-0 pr-1 md:pr-4">
                  <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-tight md:leading-normal mb-0.5">{t('darkMode')}</p>
                  <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-500 leading-snug">
                    {isDark ? t('darkModeDesc') : t('lightModeDesc')}
                  </p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                onClick={toggleDarkMode}
                className={`relative shrink-0 inline-flex h-6 w-10 md:h-7 md:w-12 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 cursor-pointer ${isDark ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-[22px] md:translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">
            {t('language')}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 md:p-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                <GlobeIcon size={20} className="md:w-6 md:h-6" weight="fill" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate">{t('language')}</p>
            </div>
            <div className="shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
