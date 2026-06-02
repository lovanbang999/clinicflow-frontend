'use client';

import type React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  borderClass?: string;
}

/**
 * Reusable stat card component for dashboard panels.
 * Eliminates DRY violations in DoctorStatsPanel and similar grids.
 */
export function StatCard({ icon, iconBg, label, value, borderClass = 'border-gray-100' }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border ${borderClass} p-4 shadow-sm flex items-center gap-3 transition-transform hover:translate-y-[-2px] hover:shadow-md cursor-default`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
