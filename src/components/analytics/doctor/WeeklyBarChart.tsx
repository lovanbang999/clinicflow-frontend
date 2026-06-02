import { BarChart, Bar, XAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useDoctorPatientsPerMonth, useDoctorWeeklyBookings } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { COLORS } from './constants';
import { CardShell, CardTitle } from './SharedComponents';
import { useTranslations, useLocale } from 'next-intl';

export function WeeklyBarChart() {
  const { data, isLoading } = useDoctorPatientsPerMonth();
  const { data: weeklyData, isLoading: isWeeklyLoading } = useDoctorWeeklyBookings();
  const t = useTranslations('doctorWorkspace');
  const locale = useLocale();

  const formatted = data.map((d) => {
    const monthNum = parseInt(d.month.split('-')[1], 10);
    return {
      month: locale === 'vi' ? `T${monthNum}` : `M${monthNum}`,
      count: d.count,
    };
  });

  const getDayLabel = (day: string) => {
    const map: Record<string, string> = locale === 'vi' ? {
      'T2': 'T2', 'T3': 'T3', 'T4': 'T4', 'T5': 'T5', 'T6': 'T6', 'T7': 'T7', 'CN': 'CN'
    } : {
      'T2': 'Mon', 'T3': 'Tue', 'T4': 'Wed', 'T5': 'Thu', 'T6': 'Fri', 'T7': 'Sat', 'CN': 'Sun'
    };
    return map[day] || day;
  };

  const weekDays = weeklyData.length > 0 ? weeklyData : [
    { day: 'T2', count: 0 }, { day: 'T3', count: 0 }, { day: 'T4', count: 0 },
    { day: 'T5', count: 0 }, { day: 'T6', count: 0 }, { day: 'T7', count: 0 }, { day: 'CN', count: 0 },
  ];
  const maxVal = Math.max(...weekDays.map((d) => d.count), 1);
  const isOverallLoading = isLoading || isWeeklyLoading;

  return (
    <CardShell>
      <CardTitle title={t('analytics.weeklyChart.title') || 'Lượt khám theo ngày'} sub={t('analytics.weeklyChart.sub') || 'Trong tuần hiện tại'} />
      {isOverallLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <>
          <div className="flex items-end gap-2 h-28">
            {weekDays.map((d, i) => {
              const heightPct = (d.count / maxVal) * 100;
              const isMax = d.count === maxVal;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full">
                  <div className="text-[10px] font-semibold text-[#111518] mb-1">{d.count || ''}</div>
                  <div className="flex-1 w-full relative flex items-end">
                    <div
                      className="w-full rounded-t-[4px] transition-all"
                      style={{ height: `${Math.max(heightPct, 4)}%`, background: isMax ? COLORS.BLUE : '#85B7EB' }}
                    />
                  </div>
                  <div className="text-[10px] text-[#64748b] mt-1">{getDayLabel(d.day)}</div>
                </div>
              );
            })}
          </div>
          {formatted.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#e5e7eb]">
              <p className="text-[11px] text-[#64748b] mb-2">{t('analytics.weeklyChart.trend') || 'Xu hướng 6 tháng'}</p>
              <ChartContainer config={{ count: { label: 'Lượt', color: COLORS.BLUE } }} className="h-14 w-full">
                <BarChart data={formatted} barSize={12} margin={{ top: 2, right: 0, bottom: 0, left: -36 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <ChartTooltip cursor={{ fill: '#f8fafc' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={COLORS.BLUE} radius={[4,4,0,0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </>
      )}
    </CardShell>
  );
}
