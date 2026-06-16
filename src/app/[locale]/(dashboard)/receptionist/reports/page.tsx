'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  CurrencyCircleDollarIcon,
  UsersIcon,
  CheckCircleIcon,
  ReceiptIcon,
  ChartLineUpIcon,
  CaretDownIcon,
  FileCsvIcon,
  PrinterIcon,
  StethoscopeIcon,
  FlaskIcon,
  PillIcon,
} from '@phosphor-icons/react';
import { DateRange } from 'react-day-picker';
import { subDays, endOfDay, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

import { 
  useReceptionistOverview, 
  useReceptionistRevenueTrend, 
  useReceptionistOperationalStats 
} from '@/lib/hooks/receptionist/useReceptionistAnalytics';
import { AdminKpiCard, StableBadge } from '@/components/dashboard/admin/AdminKpiCard';
import { AdminRevenueTrendChart } from '@/components/dashboard/admin/AdminRevenueTrendChart';
import { AdminAppointmentStatusChart } from '@/components/dashboard/admin/AdminAppointmentStatusChart';
import { AdminTopServices } from '@/components/dashboard/admin/AdminTopServices';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { Skeleton } from '@/components/ui/skeleton';

function formatVND(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B ₫`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₫`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K ₫`;
  return `${val} ₫`;
}

export default function ReceptionistReportsPage() {
  const t = useTranslations('receptionistReports');

  // Default to last 7 days (this week)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: endOfDay(new Date()),
  });

  const [activePeriod, setActivePeriod] = React.useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [exportDropdownOpen, setExportDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const apiRange = React.useMemo(() => ({
    from: dateRange?.from?.toISOString(),
    to: dateRange?.to?.toISOString(),
  }), [dateRange]);

  const { data: overview, loading: loadingOverview } = useReceptionistOverview(apiRange);
  const { data: revenueTrend, loading: loadingTrend } = useReceptionistRevenueTrend(apiRange);
  const { data: operational, loading: loadingOps } = useReceptionistOperationalStats(apiRange);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePeriodChange = (period: 'today' | 'week' | 'month') => {
    setActivePeriod(period);
    const now = new Date();
    if (period === 'today') {
      setDateRange({
        from: startOfDay(now),
        to: endOfDay(now),
      });
    } else if (period === 'week') {
      setDateRange({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfDay(now),
      });
    } else if (period === 'month') {
      setDateRange({
        from: startOfMonth(now),
        to: endOfDay(now),
      });
    }
  };

  const handleExportCSV = () => {
    if (!overview) return;

    const rows = [
      [t('csvReport.header'), ''],
      [t('csvReport.period'), `${dateRange?.from ? new Date(dateRange.from).toLocaleDateString('vi-VN') : ''} - ${dateRange?.to ? new Date(dateRange.to).toLocaleDateString('vi-VN') : ''}`],
      [t('csvReport.totalRevenue'), `${overview.totalRevenue || 0} VND`],
      [t('csvReport.checkIns'), overview.checkIns || 0],
      [t('csvReport.newPatients'), overview.newPatients || 0],
      [t('csvReport.pendingInvoices'), overview.pendingInvoices || 0],
      ['', ''],
      [t('csvReport.revenueByCategory'), ''],
      [t('csvReport.consultation'), `${overview.revenueByCategory?.CONSULTATION || 0} VND`],
      [t('csvReport.service'), `${overview.revenueByCategory?.SERVICE || 0} VND`],
      [t('csvReport.pharmacy'), `${overview.revenueByCategory?.PHARMACY || 0} VND`],
      ['', ''],
      [t('csvReport.revenueByPaymentMethod'), ''],
    ];

    operational?.paymentMethods?.forEach((pm) => {
      rows.push([pm.label, `${pm.value || 0} ${t('csvReport.transactionSuffix', { count: pm.count || 0 })}`]);
    });

    rows.push(['', '']);
    rows.push([t('csvReport.topServices'), '']);
    rows.push([t('csvReport.serviceName'), t('csvReport.bookings'), t('csvReport.estRevenue')]);
    
    operational?.topServices?.forEach((s) => {
      rows.push([s.name, s.count, `${s.revenue || 0} VND`]);
    });

    const csvContent = '\uFEFF' + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${t('csvReport.filename')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportDropdownOpen(false);
  };

  const handlePrintPDF = () => {
    window.print();
    setExportDropdownOpen(false);
  };

  return (
    <div className="px-8 py-6 space-y-6 mx-auto bg-[#fdfdfd] min-h-screen relative">
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          aside, nav, header, button, .no-print, [role="tablist"], .DateRangePicker {
            display: none !important;
          }
          body, .min-h-screen, main, #main-content {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .px-8 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 2rem;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 1rem;
          }
          .bg-white {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .grid {
            display: grid !important;
            grid-template-cols: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
          }
          .lg\\:grid-cols-3 {
            grid-template-cols: 1fr !important;
          }
          .lg\\:grid-cols-4 {
            grid-template-cols: repeat(4, 1fr) !important;
          }
        }
      `}</style>

      {/* Hidden print header */}
      <div className="hidden print-header text-center">
        <h2 className="text-2xl font-bold text-slate-900">{t('print.clinicName')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('print.systemName')}</p>
        <p className="text-sm font-semibold text-slate-800 mt-4 uppercase">{t('print.reportTitle')}</p>
        <p className="text-xs text-slate-500 mt-1">
          {t('print.period')} {dateRange?.from ? new Date(dateRange.from).toLocaleDateString('vi-VN') : ''} - {dateRange?.to ? new Date(dateRange.to).toLocaleDateString('vi-VN') : ''}
        </p>
      </div>

      {/* Page Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <ChartLineUpIcon size={24} weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{t('title')}</h1>
            <p className="text-xs text-slate-500 font-medium">{t('subtitle')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Period Selectors */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => handlePeriodChange('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activePeriod === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('periods.today')}
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activePeriod === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('periods.week')}
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activePeriod === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('periods.month')}
            </button>
          </div>

          <DateRangePicker 
            date={dateRange} 
            setDate={(range) => {
              setDateRange(range);
              setActivePeriod('custom');
            }} 
          />

          {/* Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs shadow-sm cursor-pointer"
            >
              <span>{t('export.button')}</span>
              <CaretDownIcon size={14} weight="bold" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white shadow-xl py-1.5 z-50 animate-in fade-in-50 slide-in-from-top-1">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <FileCsvIcon size={16} weight="duotone" className="text-emerald-600" />
                  <span>{t('export.csv')}</span>
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <PrinterIcon size={16} weight="duotone" className="text-blue-600" />
                  <span>{t('export.pdf')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
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
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              title={t('kpis.pendingInvoices')}
              value={(overview?.pendingInvoices || 0).toLocaleString()}
              badge={<StableBadge />}
              sub={t('kpis.pendingInvoicesSub')}
            />
          </>
        )}
      </div>

      {/* Charts Row (Hidden on print or configured carefully) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch no-print">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
         
         {/* Revenue Categories Section */}
         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{t('categories.title')}</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">{t('categories.subtitle')}</p>
              
              {loadingOverview ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Consultation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <StethoscopeIcon size={18} weight="duotone" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t('categories.consultation')}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{t('categories.consultationSub')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatVND(overview?.revenueByCategory?.CONSULTATION || 0)}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {Math.round(((overview?.revenueByCategory?.CONSULTATION || 0) / (overview?.totalRevenue || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round(((overview?.revenueByCategory?.CONSULTATION || 0) / (overview?.totalRevenue || 1)) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <FlaskIcon size={18} weight="duotone" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t('categories.service')}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{t('categories.serviceSub')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatVND(overview?.revenueByCategory?.SERVICE || 0)}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {Math.round(((overview?.revenueByCategory?.SERVICE || 0) / (overview?.totalRevenue || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round(((overview?.revenueByCategory?.SERVICE || 0) / (overview?.totalRevenue || 1)) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Pharmacy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                          <PillIcon size={18} weight="duotone" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t('categories.pharmacy')}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{t('categories.pharmacySub')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatVND(overview?.revenueByCategory?.PHARMACY || 0)}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {Math.round(((overview?.revenueByCategory?.PHARMACY || 0) / (overview?.totalRevenue || 1)) * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round(((overview?.revenueByCategory?.PHARMACY || 0) / (overview?.totalRevenue || 1)) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
         </div>

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

         {/* Top Services Section */}
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
                  estimatedRevenue: s.revenue || 0
                }))} 
                viewAllHref="/receptionist/walkin-booking"
              />
            )}
         </div>
      </div>
    </div>
  );
}
