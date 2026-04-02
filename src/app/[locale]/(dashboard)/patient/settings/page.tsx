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
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                  {isDark ? <MoonIcon size={24} weight="fill" /> : <SunIcon size={24} weight="fill" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t('darkMode')}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                    {isDark ? t('darkModeDesc') : t('lightModeDesc')}
                  </p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 cursor-pointer ${isDark ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">
            {t('language')}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                <GlobeIcon size={24} weight="fill" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{t('language')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </section>

        {/* Security Section (Placeholder) */}
        {/* <section className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">
            {t('security')}
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <button className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600">
                  <ShieldCheckIcon size={24} weight="fill" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{t('changePassword')}</p>
                  <p className="text-xs font-medium text-slate-500">{t('changePasswordDesc')}</p>
                </div>
              </div>
              <CaretRightIcon className="text-slate-300 group-hover:text-slate-500 transition-colors" weight="bold" />
            </button>
          </div>
        </section> */}
      </div>
    </div>
  );
}
