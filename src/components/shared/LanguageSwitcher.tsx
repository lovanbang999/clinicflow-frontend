'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const languageNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            relative flex items-center gap-1.5
            px-3 py-1.5 rounded-lg
            border border-[#1392ec]/30
            text-[#1392ec] text-sm font-bold tracking-widest uppercase
            bg-[#1392ec]/5 hover:bg-[#1392ec]/10
            transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1392ec]/40
            select-none cursor-pointer
          "
        >
          {locale}
          <svg
            className="w-3 h-3 opacity-60 mt-px"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-36 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-[200]"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className="
              flex items-center justify-between
              px-3 py-2 rounded-lg
              text-sm font-medium
              cursor-pointer
              transition-colors duration-150
              text-slate-700 dark:text-slate-200
              hover:bg-[#1392ec]/8 hover:text-[#1392ec] dark:hover:bg-[#1392ec]/15 dark:hover:text-[#1392ec]
              focus:bg-[#1392ec]/8 focus:text-[#1392ec] dark:focus:bg-[#1392ec]/15 dark:focus:text-[#1392ec]
            "
          >
            <span>{languageNames[loc]}</span>
            {locale === loc && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#1392ec] flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
