import Link from 'next/link';
import Image from 'next/image';

export function PatientPortalFooter() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-200 dark:border-slate-800 mt-10">
      <div className="flex flex-col items-center justify-center gap-6">
        <Link href="/patient" className="flex items-center gap-2.5 group">
          <div className="bg-blue-500 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 relative">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Smart Clinic</span>
        </Link>
        <p className="text-slate-500 dark:text-slate-400 text-sm">© 2026 Smart Clinic Patient Portal. Your health, our priority.</p>
        <div className="flex justify-center gap-6">
          <Link href="#" className="text-xs font-semibold text-slate-400 hover:text-blue-500">Support</Link>
          <Link href="#" className="text-xs font-semibold text-slate-400 hover:text-blue-500">Privacy Policy</Link>
          <Link href="#" className="text-xs font-semibold text-slate-400 hover:text-blue-500">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
