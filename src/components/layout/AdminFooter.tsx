import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr';

export function AdminFooter() {
  return (
    <footer className="shrink-0 h-12 bg-white border-t border-[#e5e7eb] px-8 flex items-center justify-between text-[#94a3b8] text-xs font-bold uppercase tracking-wider">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-green-500 rounded-full inline-block" />
          <span>Server Uptime: 99.9%</span>
        </div>
        <div className="flex items-center gap-2">
          <LockSimpleIcon size={14} />
          <span>Data Fully Encrypted (AES-256)</span>
        </div>
      </div>
      <div>© 2026 Smart Clinic • v1.0.0</div>
    </footer>
  );
}
