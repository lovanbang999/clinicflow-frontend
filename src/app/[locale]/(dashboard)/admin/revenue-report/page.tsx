'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useAdminRevenueReport } from '@/lib/hooks/admin/useAdminDashboard';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { 
  CurrencyCircleDollarIcon, 
  FileTextIcon, 
  DownloadSimpleIcon, 
  CoinsIcon
} from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function formatVND(val: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

const COLORS = ['#1392ec', '#38bdf8', '#10b981', '#f59e0b'];

export default function AdminRevenueReportPage() {
  const t = useTranslations('adminRevenueReport');
  
  // Default to current month range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const apiRange = React.useMemo(() => ({
    from: dateRange?.from?.toISOString(),
    to: dateRange?.to?.toISOString(),
  }), [dateRange]);

  const { data, loading } = useAdminRevenueReport(apiRange);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = React.useState<string>('ALL');

  const filteredInvoices = React.useMemo(() => {
    if (!data?.invoices) return [];
    return data.invoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patientCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = invoiceTypeFilter === 'ALL' || inv.invoiceType === invoiceTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [data, searchTerm, invoiceTypeFilter]);

  const pieData = React.useMemo(() => {
    if (!data?.summary.revenueByType) return [];
    const types = data.summary.revenueByType;
    return [
      { name: t('types.consultation'), value: types.CONSULTATION },
      { name: t('types.service'), value: types.SERVICE },
      { name: t('types.pharmacy'), value: types.PHARMACY },
    ].filter(item => item.value > 0);
  }, [data, t]);

  const paymentPieData = React.useMemo(() => {
    if (!data?.summary.paymentMethodRevenue) return [];
    const methods = data.summary.paymentMethodRevenue;
    return [
      { name: t('methods.cash'), value: methods.CASH },
      { name: t('methods.card'), value: methods.CARD },
      { name: t('methods.bank'), value: methods.BANK_TRANSFER },
      { name: t('methods.insurance'), value: methods.INSURANCE },
    ].filter(item => item.value > 0);
  }, [data, t]);

  const handleExportCsv = () => {
    if (!filteredInvoices.length) {
      toast.error(t('noDataToExport'));
      return;
    }

    try {
      const headers = [
        t('cols.invoiceCode'),
        t('cols.patientCode'),
        t('cols.patient'),
        t('cols.doctor'),
        t('cols.type'),
        t('cols.method'),
        t('cols.total') + ' (VND)',
        t('cols.time')
      ];
      const rows = filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.patientCode,
        inv.patientName,
        inv.doctorName,
        inv.invoiceType === 'CONSULTATION' ? t('types.consultation') : inv.invoiceType === 'SERVICE' ? t('types.service') : t('types.pharmacy'),
        inv.paymentMethod === 'CASH' ? t('methods.cash') : inv.paymentMethod === 'CARD' ? t('methods.card') : inv.paymentMethod === 'BANK_TRANSFER' ? t('methods.bank') : t('methods.insurance'),
        inv.totalAmount,
        inv.paidAt ? format(new Date(inv.paidAt), 'yyyy-MM-dd HH:mm:ss') : '—'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${t('export.filename')}_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('exportSuccess'));
    } catch {
      toast.error(t('exportError'));
    }
  };

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('periodReport')}</h1>
          <p className="text-slate-500 text-sm">{t('periodReportDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker date={dateRange} setDate={setDateRange} align="end" />
          <Button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-emerald-100 text-sm cursor-pointer"
          >
            <DownloadSimpleIcon size={18} weight="bold" />
            {t('exportBtn')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="border-slate-200 shadow-sm rounded-2xl p-6 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-2/3" />
            </Card>
          ))
        ) : (
          <>
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-[#1392ec]/20 hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <CurrencyCircleDollarIcon size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('summary.totalRevenue')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatVND(data?.summary.totalRevenue ?? 0)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-[#1392ec]/20 hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-[#1392ec]">
                  <FileTextIcon size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('summary.invoiceCount')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{t('invoiceUnit', { count: data?.summary.invoiceCount ?? 0 })}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-[#1392ec]/20 hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <CoinsIcon size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('averageOrderValue')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatVND(data?.summary.averageOrderValue ?? 0)}</h3>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm rounded-2xl min-w-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">{t('revenueStructure')}</CardTitle>
            <CardDescription className="text-xs">{t('revenueStructureDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex justify-center items-center">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : pieData.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatVND(Number(value))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-2xl min-w-0">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">{t('paymentMethods')}</CardTitle>
            <CardDescription className="text-xs">{t('paymentMethodsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex justify-center items-center">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : paymentPieData.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatVND(Number(value))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice List Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">{t('invoicesInPeriod')}</CardTitle>
            <CardDescription className="text-xs">{t('invoicesInPeriodDesc')}</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-52 h-9 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-[#1392ec]/20"
            />
            {/* Type Filter */}
            <Select value={invoiceTypeFilter} onValueChange={setInvoiceTypeFilter}>
              <SelectTrigger className="w-[150px] h-9 rounded-xl text-xs bg-white border-slate-200">
                <SelectValue placeholder={t('allServices')} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">{t('allServices')}</SelectItem>
                <SelectItem value="CONSULTATION">{t('types.consultation')}</SelectItem>
                <SelectItem value="SERVICE">{t('types.service')}</SelectItem>
                <SelectItem value="PHARMACY">{t('types.pharmacy')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.invoiceCode')}</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.patient')}</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.doctor')}</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.type')}</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.method')}</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.total')}</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase">{t('cols.time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-slate-600">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="px-6 py-4"><Skeleton className="h-6 w-full rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-10 text-center text-slate-400 text-xs font-semibold">
                      {t('noInvoicesFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map(inv => (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-6 py-4 font-semibold text-slate-800 text-xs">{inv.invoiceNumber}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">{inv.patientName}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{inv.patientCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs font-semibold">{inv.doctorName}</TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.invoiceType === 'CONSULTATION' 
                            ? 'bg-blue-50 text-blue-600' 
                            : inv.invoiceType === 'SERVICE' 
                            ? 'bg-sky-50 text-sky-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {inv.invoiceType === 'CONSULTATION' ? t('types.consultation') : inv.invoiceType === 'SERVICE' ? t('types.service') : t('types.pharmacy')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs font-semibold">
                        {inv.paymentMethod === 'CASH' ? t('methods.cash') : inv.paymentMethod === 'CARD' ? t('methods.card') : inv.paymentMethod === 'BANK_TRANSFER' ? t('methods.bank') : t('methods.insurance')}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-bold text-slate-800 text-xs">{formatVND(inv.totalAmount)}</TableCell>
                      <TableCell className="px-6 py-4 text-xs text-slate-400">
                        {inv.paidAt ? format(new Date(inv.paidAt), 'dd/MM/yyyy HH:mm') : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
