'use client';

import { useTranslations } from 'next-intl';
import {
  BarChart, Bar, XAxis, YAxis, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useDoctorTopDiagnoses, useDoctorBookingStatus, useDoctorPatientsPerMonth } from '@/lib/hooks/useDoctorAnalytics';

const DIAGNOSIS_COLORS = ['#1570EF', '#0EA5E9', '#06B6D4', '#14B8A6', '#10B981'];
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10B981',
  CANCELLED: '#F97316',
  NO_SHOW: '#EF4444',
};

export function DoctorAnalyticsPanel() {
  const t = useTranslations('doctorWorkspace');
  const { data: diagnoses, isLoading: loadingDx } = useDoctorTopDiagnoses();
  const { data: statusData, isLoading: loadingStatus } = useDoctorBookingStatus();
  const { data: trend, isLoading: loadingTrend } = useDoctorPatientsPerMonth();

  const formattedTrend = trend.map((d) => ({
    month: `T${parseInt(d.month.split('-')[1], 10)}`,
    count: d.count,
  }));

  const statusItems = statusData.map((s) => ({
    name: s.status === 'COMPLETED' ? (t('statusCompleted') ?? 'Hoàn thành') :
          s.status === 'CANCELLED' ? (t('statusCancelled') ?? 'Đã huỷ') : (t('statusNoShow') ?? 'Vắng mặt'),
    value: s.count,
    fill: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  return (
    <div className="space-y-4">
      {/* Row: Patients per Month + Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart — patients per month */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('patientsPerMonth') ?? 'Bệnh nhân theo tháng'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t('patientsPerMonthDesc') ?? 'Số lượt khám trong 6 tháng gần nhất'}</p>
          </div>
          {loadingTrend ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <ChartContainer 
              config={{
                patients: {
                  label: t('patients') ?? 'Bệnh nhân',
                  color: '#1570EF',
                }
              }} 
              className="w-full h-[148px]"
            >
              <BarChart data={formattedTrend} barSize={18} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <ChartTooltip cursor={{ fill: '#f8fafc' }} content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-patients)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>

        {/* Pie chart — booking status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('bookingStatusBreakdown') ?? 'Phân phối trạng thái lịch hẹn'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t('bookingStatusDesc') ?? 'Hoàn thành / Huỷ / Vắng mặt'}</p>
          </div>
          {loadingStatus ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : statusItems.every((s) => s.value === 0) ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-slate-400">{t('noData') ?? 'Chưa có dữ liệu'}</p>
            </div>
          ) : (
            <ChartContainer 
              config={statusItems.reduce((acc, s, idx) => {
                acc[`status_${idx}`] = { label: s.name, color: s.fill };
                return acc;
              }, {} as ChartConfig)} 
              className="w-full h-[148px]"
            >
              <PieChart>
                <Pie data={statusItems} dataKey="value" nameKey="name" cx="45%" cy="50%" outerRadius={56} label={false}>
                  {statusItems.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Top 5 Diagnoses */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('topDiagnoses') ?? 'Top chẩn đoán phổ biến'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t('topDiagnosesDesc') ?? 'Các bệnh bạn chẩn đoán nhiều nhất'}</p>
        </div>
        {loadingDx ? (
          <Skeleton className="h-36 w-full rounded-xl" />
        ) : diagnoses.length === 0 ? (
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-slate-400">{t('noData') ?? 'Chưa có dữ liệu'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {diagnoses.map((d, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: DIAGNOSIS_COLORS[idx] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{d.name}</p>
                  {d.code && <p className="text-[10px] text-slate-400">{d.code}</p>}
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
