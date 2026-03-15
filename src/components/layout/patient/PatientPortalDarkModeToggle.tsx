import { MoonIcon, SunIcon } from '@phosphor-icons/react';

interface PatientPortalDarkModeToggleProps {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export function PatientPortalDarkModeToggle({ isDark, toggleDarkMode }: PatientPortalDarkModeToggleProps) {
  return (
    <button 
      onClick={toggleDarkMode}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer ${isDark ? '' : ''}`}
    >
      {isDark ? (
        <SunIcon weight="bold" className="text-[24px]" />
      ) : (
        <MoonIcon weight="bold" className="text-[24px]" />
      )}
    </button>
  );
}
