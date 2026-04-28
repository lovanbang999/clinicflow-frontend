'use client';

import { Fragment } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorHeatmap } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { CardShell, CardTitle } from './SharedComponents';

// Clinic working hours to display (indices match hour 0-23)
const DISPLAY_HOURS = [7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18];
// Day labels: backend returns Sun=0…Sat=6; rearrange to Mon–Sun for Vietnamese layout
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
// Mapping: column index 0=Mon(1)…5=Sat(6), 6=Sun(0)
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];

function HeatmapCell({ val, max }: { val: number; max: number }) {
  const pct = max > 0 ? val / max : 0;
  let bg = '#F1EFE8';
  let color = '#5F5E5A';
  if (pct >= 0.75) { bg = '#0C447C'; color = '#fff'; }
  else if (pct >= 0.5) { bg = '#185FA5'; color = '#fff'; }
  else if (pct >= 0.25) { bg = '#85B7EB'; color = '#0C447C'; }
  else if (val > 0) { bg = '#E6F1FB'; color = '#0C447C'; }
  return (
    <div
      className="h-5 rounded flex items-center justify-center text-[9px] font-medium transition-colors"
      style={{ background: bg, color }}
      title={`${val} lượt`}
    >
      {val || ''}
    </div>
  );
}

export function HeatmapCard() {
  const { data, isLoading } = useDoctorHeatmap();

  // Find the global max for normalising the colour scale
  const max = Math.max(
    1,
    ...DISPLAY_HOURS.flatMap((hr) => DOW_ORDER.map((dow) => data[hr]?.[dow] ?? 0)),
  );

  return (
    <CardShell>
      <CardTitle title="Khung giờ bận nhất" sub="Theo giờ × thứ trong tuần (12 tuần gần nhất)" />
      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : (
        <>
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: '32px repeat(7, 1fr)' }}
          >
            {/* Header row */}
            <div />
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-[10px] text-[#64748b] text-center pb-1">
                {d}
              </div>
            ))}
            {/* Data rows */}
            {DISPLAY_HOURS.map((hr) => (
              <Fragment key={hr}>
                <div className="text-[10px] text-[#64748b] flex items-center justify-end pr-1">
                  {hr}h
                </div>
                {DOW_ORDER.map((dow) => (
                  <HeatmapCell key={dow} val={data[hr]?.[dow] ?? 0} max={max} />
                ))}
              </Fragment>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-[#64748b]">
            <span>Ít</span>
            {['#E6F1FB', '#85B7EB', '#185FA5', '#0C447C'].map((c) => (
              <div key={c} className="w-3 h-2 rounded-sm" style={{ background: c }} />
            ))}
            <span>Nhiều</span>
            <span className="ml-auto">Max: {max} lượt</span>
          </div>
        </>
      )}
    </CardShell>
  );
}
