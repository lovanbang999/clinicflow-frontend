'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorClinicalKPIs } from '@/lib/hooks/clinical/useDoctorAnalytics';
import { COLORS } from './constants';
import { CardShell, CardTitle } from './SharedComponents';

export function ClinicalKPIs() {
  const { data, isLoading } = useDoctorClinicalKPIs();

  const kpis = [
    {
      label: 'Thời gian chờ TB',
      value: data ? `${data.avgWaitMinutes} phút` : '—',
      pct: Math.min(data?.avgWaitMinutes ?? 0, 60),
      maxRef: 60,
      color: COLORS.AMBER,
      hint: 'Trung bình theo hàng đợi',
    },
    {
      label: 'Tỉ lệ tái khám',
      value: data ? `${data.returnRate}%` : '—',
      pct: data?.returnRate ?? 0,
      maxRef: 100,
      color: COLORS.GREEN,
      hint: 'Bệnh nhân quay lại ít nhất 1 lần',
    },
    {
      label: 'Đơn có xét nghiệm',
      value: data ? `${data.labOrderRate}%` : '—',
      pct: data?.labOrderRate ?? 0,
      maxRef: 100,
      color: COLORS.PURPLE,
      hint: 'Hồ sơ có ít nhất 1 chỉ định CLS',
    },
    {
      label: 'Tỉ lệ dùng ICD-10',
      value: data ? `${data.icdUsageRate}%` : '—',
      pct: data?.icdUsageRate ?? 0,
      maxRef: 100,
      color: COLORS.TEAL,
      hint: 'Hồ sơ có mã chẩn đoán ICD-10',
    },
    {
      label: 'Bệnh nhân mới',
      value: data ? `${data.newPatientRate}%` : '—',
      pct: data?.newPatientRate ?? 0,
      maxRef: 100,
      color: COLORS.CORAL,
      hint: 'Lần đầu khám với bác sĩ này',
    },
    {
      label: 'Có lịch tái khám',
      value: data ? `${data.followUpRate}%` : '—',
      pct: data?.followUpRate ?? 0,
      maxRef: 100,
      color: COLORS.BLUE,
      hint: 'Hồ sơ có ngày tái khám đặt lịch',
    },
  ];

  return (
    <CardShell>
      <CardTitle title="Chỉ số lâm sàng" sub="Hiệu suất khám — 6 tháng gần nhất" />
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {kpis.map((k, i) => (
            <div key={i} className="flex items-center gap-3" title={k.hint}>
              <div className="flex-1">
                <div className="text-[11px] text-[#64748b] mb-1">{k.label}</div>
                <div className="h-[5px] bg-[#f1f5f9] rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((k.pct / k.maxRef) * 100)}%`,
                      background: k.color,
                    }}
                  />
                </div>
              </div>
              <div className="text-[12px] font-semibold text-[#111518] w-16 text-right shrink-0">
                {k.value}
              </div>
            </div>
          ))}
          {data && (
            <p className="text-[10px] text-[#94a3b8] pt-1">
              Dựa trên {data.meta.totalBookings} lượt khám · {data.meta.totalRecords} hồ sơ
            </p>
          )}
        </div>
      )}
    </CardShell>
  );
}
