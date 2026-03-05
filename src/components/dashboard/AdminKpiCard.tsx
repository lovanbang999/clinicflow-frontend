'use client';

import React from 'react';

// Badges
export function TrendUpBadge({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
        trending_up
      </span>
      {value}
    </span>
  );
}

export function TrendDownBadge({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-bold">
      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
        trending_down
      </span>
      {value}
    </span>
  );
}

export function StableBadge() {
  return (
    <span className="text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full text-xs font-bold">
      Stable
    </span>
  );
}

// KPI Card
interface AdminKpiCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  badge: React.ReactNode;
  sub?: string;
}

export function AdminKpiCard({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  badge,
  sub,
}: AdminKpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div
          className={`size-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {icon}
          </span>
        </div>
        {badge}
      </div>
      <div>
        <p className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-[#111518] mt-1 leading-none">{value}</h3>
        {sub && <p className="text-xs text-[#94a3b8] mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
