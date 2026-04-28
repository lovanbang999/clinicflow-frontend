import { PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorBookingStatus } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { STATUS_META, COLORS } from './constants';
import { CardShell, CardTitle } from './SharedComponents';

export function BookingStatusDonut() {
  const { data, isLoading } = useDoctorBookingStatus();
  const total = data.reduce((s, d) => s + d.count, 0);
  const pieData = data.map((d) => ({
    name: STATUS_META[d.status]?.label ?? d.status,
    value: d.count,
    color: STATUS_META[d.status]?.color ?? COLORS.GRAY,
  }));

  return (
    <CardShell>
      <CardTitle title="Phân bổ lịch hẹn" sub="Tháng này" />
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : total === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[#64748b]">Chưa có dữ liệu</div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={44} strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <RechartTooltip formatter={(v: number, n: string) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-lg font-bold text-[#111518] leading-none">{total}</div>
              <div className="text-[9px] text-[#64748b]">tổng</div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            {pieData.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                <span className="text-[#64748b] flex-1">{e.name}</span>
                <span className="font-semibold text-[#111518]">
                  {total > 0 ? `${Math.round((e.value / total) * 100)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
}
