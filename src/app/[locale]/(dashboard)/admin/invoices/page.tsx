'use client';

import { useTranslations } from 'next-intl';
import { useAdminInvoices } from '@/lib/hooks/admin/useAdminInvoices';
import { BillingTable } from '@/components/dashboard/billing/BillingTable';
import { InvoiceStatus, InvoiceType, billingApi } from '@/lib/api/billing/billing';
import { 
  MagnifyingGlassIcon,
  XIcon,
  CalendarIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import { useState, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function AdminInvoicesPage() {
  const t = useTranslations('adminInvoices');
  const tCommon = useTranslations('receptionistBilling');
  
  const { 
    invoices, 
    pagination,
    loading, 
    params, 
    updateFilters,
    goToPage 
  } = useAdminInvoices();

  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const hasActiveFilters = !!(params.status || params.invoiceType || params.startDate || params.endDate);

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await billingApi.exportInvoices({
        status: params.status,
        invoiceType: params.invoiceType,
        startDate: params.startDate,
        endDate: params.endDate,
        search: searchTerm || undefined,
      });

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t('export.success'));
    } catch {
      toast.error(t('export.error'));
    } finally {
      setIsExporting(false);
    }
  }, [params, searchTerm, t]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
          <p className="text-slate-500">{t('subtitle')}</p>
        </div>

        {/* Export CSV */}
        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isExporting ? (
            <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <DownloadSimpleIcon size={17} weight="bold" />
          )}
          {t('export.button')}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={tCommon('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date From */}
            <div className="relative flex items-center">
              <CalendarIcon size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="date"
                title={t('filter.dateFrom')}
                value={params.startDate ?? ''}
                onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all text-slate-600 cursor-pointer"
              />
            </div>

            <span className="text-slate-400 text-sm">—</span>

            {/* Date To */}
            <div className="relative flex items-center">
              <CalendarIcon size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="date"
                title={t('filter.dateTo')}
                value={params.endDate ?? ''}
                onChange={(e) => updateFilters({ endDate: e.target.value || undefined })}
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all text-slate-600 cursor-pointer"
              />
            </div>

            {/* Status filter */}
            <Select 
              value={params.status || "ALL"} 
              onValueChange={(val) => updateFilters({ status: val === "ALL" ? undefined : val as InvoiceStatus })}
            >
              <SelectTrigger size="sm" className="w-[160px] bg-slate-50 border-slate-200 rounded-xl cursor-pointer h-9">
                <SelectValue placeholder={tCommon('filter.all')} />
              </SelectTrigger>
              <SelectContent position='popper' align='end'>
                <SelectItem value="ALL">{tCommon('filter.all')}</SelectItem>
                {Object.values(InvoiceStatus).map(status => (
                  <SelectItem key={status} value={status}>{tCommon(`filter.${status.toLowerCase()}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Invoice type filter */}
            <Select 
              value={params.invoiceType || "ALL"} 
              onValueChange={(val) => updateFilters({ invoiceType: val === "ALL" ? undefined : val as InvoiceType })}
            >
              <SelectTrigger size="sm" className="w-[160px] bg-slate-50 border-slate-200 rounded-xl cursor-pointer h-9">
                <SelectValue placeholder={t('filter.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent position='popper' align='end'>
                <SelectItem value="ALL">{t('filter.typePlaceholder')}</SelectItem>
                <SelectItem value={InvoiceType.CONSULTATION}>{tCommon('bookingInvoices.types.CONSULTATION')}</SelectItem>
                <SelectItem value={InvoiceType.SERVICE}>{tCommon('bookingInvoices.types.SERVICE')}</SelectItem>
                <SelectItem value={InvoiceType.PHARMACY}>{tCommon('bookingInvoices.types.PHARMACY')}</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button 
                onClick={() => updateFilters({ status: undefined, invoiceType: undefined, startDate: undefined, endDate: undefined })}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <XIcon size={14} weight="bold" />
                {t('filter.clear')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <BillingTable 
          invoices={invoices} 
          loading={loading} 
          basePath="/admin/invoices"
          tPath="adminInvoices"
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-500">
          {t('pagination.showing', { 
            start: Math.min(((params.page || 1) - 1) * (pagination.limit || 20) + 1, pagination.total || 0),
            end: Math.min((params.page || 1) * (pagination.limit || 20), pagination.total || 0),
            total: pagination.total || 0
          })}
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={params.page === 1}
            onClick={() => goToPage((params.page || 1) - 1)}
            className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors text-xs font-medium cursor-pointer"
          >
            {t('pagination.previous')}
          </button>
          <button 
            disabled={(params.page || 1) >= pagination.totalPages}
            onClick={() => goToPage((params.page || 1) + 1)}
            className="px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors text-xs font-medium cursor-pointer"
          >
            {t('pagination.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
