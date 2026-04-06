'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useTranslations } from 'next-intl';
import { DownloadIcon, UserIcon } from '@phosphor-icons/react';
import { useAdminRevenueChart } from '@/lib/hooks/admin/useAdminDashboard';
import { RevenueChartItem } from '@/lib/api/clinic/dashboard';

interface AdminRevenueTrendChartProps {
  data?: RevenueChartItem[];
  loading?: boolean;
  isExternalRange?: boolean;
  chartHeight?: string;
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#1392ec',
  },
} satisfies ChartConfig;

// Format "YYYY-MM-01" -> "Jan", "Feb", etc.
function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short' });
}

// Format "YYYY-MM-DD" -> "Jan 01", etc.
function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

export function AdminRevenueTrendChart({ 
  data: externalData, 
  loading: externalLoading,
  isExternalRange = false,
  chartHeight = 'h-[200px]' 
}: AdminRevenueTrendChartProps) {
  const [range, setRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('adminOverview.chart');

  // If external data is NOT provided, use internal hook
  const { data: internalData, loading: internalLoading } = useAdminRevenueChart(
    range, 
    undefined,
    !externalData && !isExternalRange
  );
  
  const data = externalData || internalData;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  const chartData = (data ?? []).map((point) => ({
    label: isExternalRange ? formatDay(point.date) : (range === 'quarter' ? formatMonth(point.date) : formatDay(point.date)),
    revenue: point.revenue,
  }));

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Find all elements in the cloned document and strip oklch/lab colors if they exist
          // Although we changed globals.css, Tailwind or other libraries might still inject them.
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            if (el.style) {
              // Simple cleanup - if any style contains 'oklch' or 'lab', we clear it or try to fallback
              // This is a safety measure.
              const style = el.style as unknown as Record<string, string>;
              const styleKeys = Object.keys(style);
              styleKeys.forEach(key => {
                const val = style[key];
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('lab'))) {
                  style[key] = ''; // Remove problematic style
                }
              });
            }
          }
          
          // Also check for <style> tags and remove oklch/lab definitions
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            let content = styles[i].innerHTML;
            if (content.includes('oklch(') || content.includes('lab(')) {
              // Regex to remove properties using oklch or lab
              content = content.replace(/[a-z-]+\s*:\s*(oklch|lab)\([^)]+\);?/g, '');
              styles[i].innerHTML = content;
            }
          }
        }
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `revenue-chart-${range}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export chart', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm h-full flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#111518]">{t('revenueTrend')}</h3>
          <p className="text-[#94a3b8] text-xs font-medium mt-0.5">{t('clinicalEarnings')}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isExternalRange && (
            <Select value={range} onValueChange={(v) => setRange(v as 'week' | 'month' | 'quarter')}>
              <SelectTrigger
                size="sm"
                className="w-[140px] text-xs font-semibold text-[#64748b] border-[#e5e7eb] bg-[#f8fafc] rounded-lg"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position='popper' side='bottom'>
                <SelectItem value="week">{t('ranges.week')}</SelectItem>
                <SelectItem value="month">{t('ranges.month')}</SelectItem>
                <SelectItem value="quarter">{t('ranges.quarter')}</SelectItem>
              </SelectContent>
            </Select>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting || loading}
            className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-[#e5e7eb] bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('export-hint')}
          >
            <DownloadIcon size={16} weight="bold" />
            <span className="hidden sm:inline">{isExporting ? '...' : t('export')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <div className="size-6 border-2 border-[#1392ec] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <UserIcon weight="fill" className="text-slate-300 text-2xl" />
          </div>
          <p className="text-sm text-slate-400">{t('noActivity')}</p>
        </div>
      ) : (
        <div ref={chartRef} className="pt-2 bg-white pb-2 pr-4 flex-1 min-w-0">
          <ChartContainer config={chartConfig} className={`w-full ${chartHeight}`}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1392ec" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1392ec" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
              strokeDasharray="0"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }}
              dy={6}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 600 }}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(1)}M`
                  : v >= 1000
                  ? `${(v / 1000).toFixed(0)}K`
                  : `${v}`
              }
              width={48}
            />

            <ChartTooltip
              cursor={{ stroke: '#1392ec', strokeWidth: 1, strokeDasharray: '4 2' }}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    `${Number(value).toLocaleString('vi-VN')} ₫`
                  }
                  labelClassName="font-semibold text-[#111518]"
                />
              }
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1392ec"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#1392ec',
                stroke: 'white',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      )}
    </div>
  );
}
