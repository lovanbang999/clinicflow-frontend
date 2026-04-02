'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  CurrencyCircleDollarIcon,
  UsersIcon,
  CheckCircleIcon,
  ReceiptIcon,
  ChartLineUpIcon,
} from '@phosphor-icons/react';
import { DateRange } from 'react-day-picker';
import { subDays, endOfDay } from 'date-fns';

import { 
  useReceptionistOverview, 
  useReceptionistRevenueTrend, 
  useReceptionistOperationalStats 
} from '@/lib/hooks/useReceptionistAnalytics';
import { AdminKpiCard, StableBadge } from '@/components/dashboard/AdminKpiCard';
import { AdminRevenueTrendChart } from '@/components/dashboard/AdminRevenueTrendChart';
import { AdminAppointmentStatusChart } from '@/components/dashboard/AdminAppointmentStatusChart';
import { AdminTopServices } from '@/components/dashboard/AdminTopServices';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { Skeleton } from '@/components/ui/skeleton';

function formatVND(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B ₫`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₫`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K ₫`;
  return `${val} ₫`;
}

export default function ReceptionistReportsPage() {
  const t = useTranslations('receptionistReports');

  // Default to last 7 days for the trend
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: endOfDay(new Date()),
  });

  const apiRange = React.useMemo(() => ({
    from: dateRange?.from?.toISOString(),
    to: dateRange?.to?.toISOString(),
  }), [dateRange]);

  const { data: overview, loading: loadingOverview } = useReceptionistOverview(apiRange);
  const { data: revenueTrend, loading: loadingTrend } = useReceptionistRevenueTrend(apiRange);
  const { data: operational, loading: loadingOps } = useReceptionistOperationalStats(apiRange);

  return (
    <div className="px-8 py-6 space-y-6 mx-auto bg-[#fdfdfd] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <ChartLineUpIcon size={24} weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{t('title')}</h1>
            <p className="text-xs text-slate-500 font-medium">{t('subtitle')}</p>
          </div>
        </div>

        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingOverview ? (
          [1, 2, 3, 4].map((i) => (
             <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-7 w-1/2" />
            </div>
          ))
        ) : (
          <>
            <AdminKpiCard
              icon={CurrencyCircleDollarIcon}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title={t('kpis.revenue')}
              value={formatVND(overview?.totalRevenue || 0)}
              badge={<StableBadge />}
              sub={t('kpis.revenueSub')}
            />
            <AdminKpiCard
              icon={CheckCircleIcon}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title={t('kpis.checkIns')}
              value={(overview?.checkIns || 0).toLocaleString()}
              badge={<StableBadge />}
              sub={t('kpis.checkInsSub')}
            />
            <AdminKpiCard
              icon={UsersIcon}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              title={t('kpis.newPatients')}
              value={(overview?.newPatients || 0).toLocaleString()}
              badge={<StableBadge />}
              sub={t('kpis.newPatientsSub')}
            />
            <AdminKpiCard
              icon={ReceiptIcon}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              title={t('kpis.pendingInvoices')}
              value={(overview?.pendingInvoices || 0).toLocaleString()}
              badge={<StableBadge />}
              sub={t('kpis.pendingInvoicesSub')}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 h-full">
          <AdminRevenueTrendChart 
            data={revenueTrend} 
            loading={loadingTrend} 
            isExternalRange={true}
            chartHeight="h-full min-h-[350px]"
          />
        </div>
        
        <div className="h-full">
           <AdminAppointmentStatusChart 
            overview={(() => {
              if (!operational || !operational.appointmentStatuses) return null;
              
              const total = operational.appointmentStatuses.reduce((acc, curr) => acc + curr.value, 0);
              const completed = operational.appointmentStatuses.find(s => s.label === 'COMPLETED')?.value || 0;
              const upcoming = operational.appointmentStatuses.reduce((acc, curr) => 
                (curr.label === 'CONFIRMED' || curr.label === 'PENDING') ? acc + curr.value : acc, 0
              );
              const cancelled = operational.appointmentStatuses.find(s => s.label === 'CANCELLED')?.value || 0;
              
              const safeDiv = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
              
              return {
                total,
                completed,
                upcoming,
                cancelled,
                inProgress: 0,
                completedPct: safeDiv(completed, total),
                upcomingPct: safeDiv(upcoming, total),
                cancelledPct: safeDiv(cancelled, total),
              };
            })()} 
            loading={loadingOps} 
          />
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Payment Methods Section */}
         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('charts.paymentMethods')}</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">{t('charts.paymentMethodsSub')}</p>
            
            {loadingOps ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {operational?.paymentMethods?.map((pm, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                          {pm.label.split('_')[0]}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">{pm.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{pm.count} {t('charts.transactions')}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-slate-900">{formatVND(pm.value)}</p>
                    </div>
                  </div>
                ))}
                {(!operational?.paymentMethods || operational.paymentMethods.length === 0) && (
                   <div className="py-12 text-center text-slate-400 text-sm">{t('charts.noTransactions')}</div>
                )}
              </div>
            )}
         </div>

         <div className="h-full">
            {loadingOps ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                </div>
              </div>
            ) : (
              <AdminTopServices 
                services={(operational?.topServices || []).map(s => ({
                  id: s.name,
                  name: s.name,
                  bookingsCount: s.count,
                  estimatedRevenue: 0
                }))} 
                viewAllHref="/receptionist/walkin-booking"
              />
            )}
         </div>
      </div>
    </div>
  );
}
