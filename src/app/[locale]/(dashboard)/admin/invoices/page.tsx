'use client';

import { useTranslations } from 'next-intl';
import { useAdminInvoices } from '@/lib/hooks/admin/useAdminInvoices';
import { BillingTable } from '@/components/dashboard/billing/BillingTable';
import { InvoiceStatus, InvoiceType } from '@/lib/api/billing/billing';
import { 
  MagnifyingGlassIcon,
  XIcon
} from '@phosphor-icons/react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
        <p className="text-slate-500">{t('subtitle')}</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={tCommon('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select 
              value={params.status || "ALL"} 
              onValueChange={(val) => updateFilters({ status: val === "ALL" ? undefined : val as InvoiceStatus })}
            >
              <SelectTrigger size="sm" className="w-[180px] bg-slate-50 border-slate-200 rounded-xl cursor-pointer h-9">
                <SelectValue placeholder={tCommon('filter.all')} />
              </SelectTrigger>
              <SelectContent position='popper' align='end'>
                <SelectItem value="ALL">{tCommon('filter.all')}</SelectItem>
                {Object.values(InvoiceStatus).map(status => (
                  <SelectItem key={status} value={status}>{tCommon(`filter.${status.toLowerCase()}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={params.invoiceType || "ALL"} 
              onValueChange={(val) => updateFilters({ invoiceType: val === "ALL" ? undefined : val as InvoiceType })}
            >
              <SelectTrigger size="sm" className="w-[180px] bg-slate-50 border-slate-200 rounded-xl cursor-pointer h-9">
                <SelectValue placeholder={t('filter.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent position='popper' align='end'>
                <SelectItem value="ALL">{t('filter.typePlaceholder')}</SelectItem>
                <SelectItem value={InvoiceType.CONSULTATION}>{tCommon('bookingInvoices.types.CONSULTATION')}</SelectItem>
                <SelectItem value={InvoiceType.SERVICE}>{tCommon('bookingInvoices.types.SERVICE')}</SelectItem>
                <SelectItem value={InvoiceType.PHARMACY}>{tCommon('bookingInvoices.types.PHARMACY')}</SelectItem>
              </SelectContent>
            </Select>

            {(params.status || params.invoiceType) && (
              <button 
                onClick={() => updateFilters({ status: undefined, invoiceType: undefined })}
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
