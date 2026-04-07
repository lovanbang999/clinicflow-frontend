'use client';

import { useState } from 'react';
import { Period, PERIODS } from './doctor/constants';
import { SummaryCards } from './doctor/SummaryCards';
import { WeeklyBarChart } from './doctor/WeeklyBarChart';
import { BookingStatusDonut } from './doctor/BookingStatusDonut';
import { SourceBreakdown } from './doctor/SourceBreakdown';
import { TopDiagnoses } from './doctor/TopDiagnoses';
import { HeatmapCard } from './doctor/HeatmapCard';
import { ClinicalKPIs } from './doctor/ClinicalKPIs';
import { RecentPatientsList } from './doctor/RecentPatientsList';
import { TodayTimeline } from './doctor/TodayTimeline';

// Main Component
export function DoctorAnalyticsPanel() {
  const [period, setPeriod] = useState<Period>('month');

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex justify-end">
        <div className="inline-flex gap-1 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                period === p.value
                  ? 'bg-[#185FA5] text-white shadow-sm'
                  : 'text-[#64748b] hover:bg-[#e2e8f0]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards period={period} />

      {/* Charts Row: Bar + Donut + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WeeklyBarChart />
        <BookingStatusDonut />
        <SourceBreakdown period={period} />
      </div>

      {/* Analysis Row: Diagnoses + Heatmap + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopDiagnoses />
        <HeatmapCard />
        <ClinicalKPIs />
      </div>

      {/* Bottom Row: Recent patients + Today timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentPatientsList />
        <TodayTimeline />
      </div>
    </div>
  );
}
