'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { InvoiceStatus, type Invoice } from '@/lib/api/billing/billing';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ReceiptIcon,
  SealCheckIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import {
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyInvoices } from '@/lib/hooks/billing/useMyInvoices';

// Subcomponents
import { PatientInvoiceStatusBadge } from '@/components/dashboard/patient/PatientInvoiceStatusBadge';
import { PatientInvoiceTypeBadge } from '@/components/dashboard/patient/PatientInvoiceTypeBadge';
import { PatientInvoiceDetails } from '@/components/dashboard/patient/PatientInvoiceDetails';

// Utilities
import { printInvoice } from '@/lib/utils/print-invoice';

export default function PatientInvoicesPage() {
  const t = useTranslations('patientOverview');
  const locale = useLocale();
  const { invoices, isLoading: loading, fetchMyInvoices } = useMyInvoices();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'CANCELLED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CONSULTATION' | 'SERVICE' | 'PHARMACY'>('ALL');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    void fetchMyInvoices({ limit: 50 });
  }, [fetchMyInvoices]);

  const dateLocale = locale === 'vi' ? vi : undefined;
  
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Client-side filtering for zero-latency response
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Search filter
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.items.some((item) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Status filter
      let matchesStatus = true;
      if (statusFilter === 'PAID') {
        matchesStatus = inv.status === InvoiceStatus.PAID;
      } else if (statusFilter === 'UNPAID') {
        matchesStatus = [InvoiceStatus.DRAFT, InvoiceStatus.OPEN, InvoiceStatus.ISSUED].includes(inv.status);
      } else if (statusFilter === 'CANCELLED') {
        matchesStatus = inv.status === InvoiceStatus.CANCELLED;
      }

      // 3. Type filter
      let matchesType = true;
      if (typeFilter !== 'ALL') {
        matchesType = inv.invoiceType === typeFilter;
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, searchTerm, statusFilter, typeFilter]);

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  const handlePrint = (inv: Invoice) => {
    printInvoice(inv, t);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('invoices')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('invoicesSubtitle')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 md:p-5 shadow-xs space-y-4">
        {/* Search Field */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-750 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl transition-all outline-hidden text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Status Filters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {t('filters.statusLabel')}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  statusFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('filters.allStatus')}
              </button>
              <button
                onClick={() => setStatusFilter('PAID')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  statusFilter === 'PAID'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('status.paid')}
              </button>
              <button
                onClick={() => setStatusFilter('UNPAID')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  statusFilter === 'UNPAID'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('status.unpaid')}
              </button>
              <button
                onClick={() => setStatusFilter('CANCELLED')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  statusFilter === 'CANCELLED'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('status.cancelled')}
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {t('filters.typeLabel')}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  typeFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('invoiceTypes.all')}
              </button>
              <button
                onClick={() => setTypeFilter('CONSULTATION')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  typeFilter === 'CONSULTATION'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('invoiceTypes.consultation')}
              </button>
              <button
                onClick={() => setTypeFilter('SERVICE')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  typeFilter === 'SERVICE'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('invoiceTypes.service')}
              </button>
              <button
                onClick={() => setTypeFilter('PHARMACY')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all active:scale-[0.97] ${
                  typeFilter === 'PHARMACY'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750'
                }`}
              >
                {t('invoiceTypes.pharmacy')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <ReceiptIcon size={32} className="text-slate-300 dark:text-slate-600" weight="duotone" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {t('noInvoices')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
              {t('noInvoicesDesc')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr className="border-0">
                  <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-11">
                    {t('invoiceNumber')}
                  </th>
                  <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-11">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-11">
                    {t('receipt.itemName')}
                  </th>
                  <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-11">
                    {t('status.label')}
                  </th>
                  <th className="px-6 py-3 font-bold text-slate-400 uppercase tracking-widest text-[10px] h-11 text-right">
                    {t('total')}
                  </th>
                  <th className="w-12 px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredInvoices.map((inv) => (
                  <React.Fragment key={inv.id}>
                    <tr
                      onClick={() => toggleExpand(inv.id)}
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/15 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <SealCheckIcon size={18} weight="duotone" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                            #{inv.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-slate-500 dark:text-slate-400 text-xs tabular-nums">
                        <div className="flex items-center gap-2">
                          <CalendarBlankIcon size={13} className="text-slate-400" />
                          {format(new Date(inv.createdAt), 'dd/MM/yyyy', { locale: dateLocale })}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <PatientInvoiceTypeBadge type={inv.invoiceType} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {inv.items?.[0]?.itemName ?? 'Consultation'}
                          </span>
                          {inv.items.length > 1 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{inv.items.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <PatientInvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4.5 text-right font-black tabular-nums text-slate-900 dark:text-white">
                        {formatMoney(inv.totalAmount)}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        {expandedInvoiceId === inv.id ? (
                          <ChevronUp size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                        )}
                      </td>
                    </tr>
                    {expandedInvoiceId === inv.id && (
                      <tr className="bg-slate-50/20 dark:bg-slate-900/10">
                        <td colSpan={6} className="px-6 py-4 border-t-0">
                          <PatientInvoiceDetails inv={inv} onPrint={handlePrint} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => toggleExpand(inv.id)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 shadow-2xs space-y-3.5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 bg-blue-50 dark:bg-blue-900/15 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ReceiptIcon size={16} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        #{inv.invoiceNumber}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <PatientInvoiceTypeBadge type={inv.invoiceType} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PatientInvoiceStatusBadge status={inv.status} />
                    {expandedInvoiceId === inv.id ? (
                      <ChevronUp size={14} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={14} className="text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold tabular-nums">
                    <CalendarBlankIcon size={12} />
                    {format(new Date(inv.createdAt), 'dd/MM/yyyy', { locale: dateLocale })}
                  </div>
                  <p className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(inv.totalAmount)}
                  </p>
                </div>

                {expandedInvoiceId === inv.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200"
                  >
                    <PatientInvoiceDetails inv={inv} onPrint={handlePrint} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
