'use client';

import { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Period } from './doctor/constants';
import { SummaryCards } from './doctor/SummaryCards';
import { WeeklyBarChart } from './doctor/WeeklyBarChart';
import { BookingStatusDonut } from './doctor/BookingStatusDonut';
import { SourceBreakdown } from './doctor/SourceBreakdown';
import { TopDiagnoses } from './doctor/TopDiagnoses';
import { TopServicesCard } from './doctor/TopServicesCard';
import { HeatmapCard } from './doctor/HeatmapCard';
import { ClinicalKPIs } from './doctor/ClinicalKPIs';
import { RecentPatientsList } from './doctor/RecentPatientsList';
import { TodayTimeline } from './doctor/TodayTimeline';
import { analyticsApi } from '@/lib/api/admin/analytics';
import { useTranslations, useLocale } from 'next-intl';

// Main Component
export function DoctorAnalyticsPanel() {
  const [period, setPeriod] = useState<Period>('month');
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations('doctorWorkspace');
  const locale = useLocale();

  const periods = [
    { label: t('analytics.periods.7d') || '7 ngày', value: '7d' as Period },
    { label: t('analytics.periods.month') || 'Tháng này', value: 'month' as Period },
    { label: t('analytics.periods.6m') || '6 tháng', value: '6m' as Period },
    { label: t('analytics.periods.year') || 'Năm nay', value: 'year' as Period },
  ];

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      // Fetch fresh data for the export
      const [summary, kpis, diagnoses, services] = await Promise.all([
        analyticsApi.getDoctorSummary(period),
        analyticsApi.getDoctorClinicalKPIs(),
        analyticsApi.getDoctorTopDiagnoses(),
        analyticsApi.getDoctorTopServices(),
      ]);

      const periodLabel = t(`analytics.periods.${period}`) || period;
      const dateStr = new Date().toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US');

      // Construct beautifully formatted CSV content (with UTF-8 support)
      let csv = "\uFEFF"; // UTF-8 BOM to display accented characters correctly in Excel
      csv += `${t('analytics.csv.title') || 'BÁO CÁO THỐNG KÊ CÁ NHÂN BÁC SĨ'}\n`;
      csv += `${t('analytics.csv.period', { period: periodLabel }) || `Kỳ thống kê: ${periodLabel}`}\n`;
      csv += `${t('analytics.csv.date', { date: dateStr }) || `Ngày xuất báo cáo: ${dateStr}`}\n\n`;

      // 1. Summary section
      csv += `${t('analytics.csv.secSummary') || '1. CHỈ SỐ TỔNG QUAN'}\n`;
      csv += `${t('analytics.csv.summaryHeaders') || 'Chỉ số,Giá trị,Biến động so với kỳ trước'}\n`;
      csv += `"${t('analytics.summary.total') || 'Tổng lượt khám'}",${summary.total},${summary.deltaTotal > 0 ? '+' : ''}${summary.deltaTotal}%\n`;
      csv += `"${t('analytics.summary.completed') || 'Hoàn thành'}",${summary.completed},${summary.deltaCompleted > 0 ? '+' : ''}${summary.deltaCompleted}%\n`;
      csv += `"${t('analytics.summary.absentCancel') || 'Vắng / Hủy'}",${summary.absentCancel},${summary.deltaAbsentCancel > 0 ? '+' : ''}${summary.deltaAbsentCancel}%\n`;

      const formattedRevenue = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0,
      }).format(locale === 'vi' ? summary.revenue : Math.round(summary.revenue / 25400));

      csv += `"${t('analytics.summary.revenue') || 'Doanh thu tư vấn'}","${formattedRevenue}",${summary.deltaRevenue > 0 ? '+' : ''}${summary.deltaRevenue}%\n`;
      csv += `"${t('analytics.summary.avgMinutes') || 'Thời gian khám TB'}",${summary.avgMinutes} ${locale === 'vi' ? 'phút' : 'mins'},-\n`;
      csv += `"${t('analytics.summary.rating') || 'Đánh giá trung bình'}",${summary.rating}/5.0,-\n\n`;

      // 2. Clinical KPIs
      csv += `${t('analytics.csv.secKPIs') || '2. CHỈ SỐ HIỆU SUẤT LÂM SÀNG (6 THÁNG QUA)'}\n`;
      csv += `${t('analytics.csv.kpiHeaders') || 'Chỉ số hiệu suất,Tỷ lệ / Giá trị'}\n`;
      csv += `"${t('analytics.clinicalKPIs.avgWaitTime') || 'Thời gian chờ TB của bệnh nhân'}",${kpis.avgWaitMinutes} ${locale === 'vi' ? 'phút' : 'mins'}\n`;
      csv += `"${t('analytics.clinicalKPIs.returnRate') || 'Tỷ lệ bệnh nhân quay lại'}",${kpis.returnRate}%\n`;
      csv += `"${t('analytics.clinicalKPIs.labOrderRate') || 'Tỷ lệ chỉ định cận lâm sàng (CLS)'}",${kpis.labOrderRate}%\n`;
      csv += `"${t('analytics.clinicalKPIs.icdUsageRate') || 'Tỷ lệ hồ sơ dùng mã chẩn đoán ICD-10'}",${kpis.icdUsageRate}%\n`;
      csv += `"${t('analytics.clinicalKPIs.newPatientRate') || 'Tỷ lệ bệnh nhân mới'}",${kpis.newPatientRate}%\n`;
      csv += `"${t('analytics.clinicalKPIs.followUpRate') || 'Tỷ lệ hẹn tái khám thành công'}",${kpis.followUpRate}%\n\n`;

      // 3. Top Diagnoses
      csv += `${t('analytics.csv.secDiagnoses') || '3. TOP 5 CHẨN ĐOÁN PHỔ BIẾN (MÃ ICD-10)'}\n`;
      csv += `${t('analytics.csv.diagnosesHeaders') || 'Hạng,Tên bệnh,Mã bệnh (ICD-10),Số ca'}\n`;
      diagnoses.forEach((d, i) => {
        csv += `${i + 1},"${d.name}",${d.code ?? '-'},${d.count}\n`;
      });
      csv += `\n`;

      // 4. Top Services
      csv += `${t('analytics.csv.secServices') || '4. TOP 5 DỊCH VỤ THỰC HIỆN NHIỀU NHẤT'}\n`;
      csv += `${t('analytics.csv.serviceHeaders') || 'Hạng,Tên dịch vụ,Số ca hoàn thành'}\n`;
      services.forEach((s, i) => {
        csv += `${i + 1},"${s.name}",${s.count}\n`;
      });

      // Create a blob and download it
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      const downloadFilename = locale === 'vi'
        ? `Bao_cao_thong_ke_bac_si_${period}_${new Date().toISOString().slice(0, 10)}.csv`
        : `Doctor_analytics_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
        
      link.setAttribute("download", downloadFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export CSV report", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Action bar for CSV export and Period selector */}
      <div className="flex justify-end items-center gap-2 border-b border-[#e5e7eb] pb-4 flex-wrap">
        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e7eb] hover:border-[#185FA5]/40 rounded-xl bg-white hover:bg-[#f8fafc] text-[12px] font-medium text-[#185FA5] transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadIcon size={14} className={isExporting ? 'animate-bounce' : ''} />
          <span>{isExporting ? (t('analytics.exporting') || 'Đang xuất...') : (t('analytics.exportCsv') || 'Xuất báo cáo (CSV)')}</span>
        </button>

        <div className="inline-flex gap-1 bg-[#f8fafc] border border-[#e5e7eb] rounded-xl p-1">
          {periods.map((p) => (
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

      {/* Charts Row: Bar + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyBarChart />
        </div>
        <BookingStatusDonut />
      </div>

      {/* Services & Source Row: Top Services + Source Breakdown + Clinical KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopServicesCard />
        <SourceBreakdown period={period} />
        <ClinicalKPIs />
      </div>

      {/* Analysis Row: Diagnoses + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopDiagnoses />
        <div className="lg:col-span-2">
          <HeatmapCard />
        </div>
      </div>

      {/* Bottom Row: Recent patients + Today timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentPatientsList />
        <TodayTimeline />
      </div>
    </div>
  );
}
