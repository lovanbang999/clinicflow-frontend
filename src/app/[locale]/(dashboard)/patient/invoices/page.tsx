'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { InvoiceStatus, InvoiceType, type Invoice } from '@/lib/api/billing/billing';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import {
  ReceiptIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SealCheckIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Printer,
  FileText,
  CreditCard,
  Activity,
  DollarSign
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useMyInvoices } from '@/lib/hooks/billing/useMyInvoices';

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useTranslations('receptionistBilling.status');

  switch (status) {
    case InvoiceStatus.PAID:
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 py-1 px-2.5 rounded-full capitalize">
          <CheckCircleIcon weight="fill" />
          {t('paid')}
        </Badge>
      );
    case InvoiceStatus.DRAFT:
    case InvoiceStatus.OPEN:
    case InvoiceStatus.ISSUED:
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 py-1 px-2.5 rounded-full capitalize">
          <ClockIcon weight="fill" />
          {t('open')}
        </Badge>
      );
    case InvoiceStatus.CANCELLED:
      return (
        <Badge className="bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 py-1 px-2.5 rounded-full capitalize">
          <XCircleIcon weight="fill" />
          {t('cancelled')}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function InvoiceTypeBadge({ type }: { type: InvoiceType }) {
  const t = useTranslations('patientOverview');
  switch (type) {
    case InvoiceType.CONSULTATION:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400">
          <Activity size={12} />
          {t('invoiceTypes.consultation')}
        </span>
      );
    case InvoiceType.SERVICE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400">
          <FileText size={12} />
          {t('invoiceTypes.service')}
        </span>
      );
    case InvoiceType.PHARMACY:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400">
          <ReceiptIcon size={12} />
          {t('invoiceTypes.pharmacy')}
        </span>
      );
    default:
      return <span className="text-xs text-slate-500">{type}</span>;
  }
}

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

  // Browser print layout utility
  const handlePrint = (inv: Invoice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const itemsHtml = inv.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">${item.itemName}</td>
        <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; text-align: right; font-size: 13px; font-family: monospace;">${formatMoney(item.unitPrice)}</td>
        <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; text-align: center; font-size: 13px; font-family: monospace;">${item.quantity}</td>
        <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0; text-align: right; font-weight: bold; font-size: 13px; font-family: monospace;">${formatMoney(item.totalPrice)}</td>
      </tr>
    `
      )
      .join('');

    const formattedDate = format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm');
    const formattedPaidDate = inv.paidAt ? format(new Date(inv.paidAt), 'dd/MM/yyyy HH:mm') : '';

    const methodLabel = inv.payments?.[0]?.paymentMethod
      ? t(`receipt.${inv.payments[0].paymentMethod.toLowerCase()}`)
      : '';

    const docHtml = `
      <html>
        <head>
          <title>Invoice - ${inv.invoiceNumber}</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              color: #1e293b; 
              margin: 40px; 
              line-height: 1.5;
            }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
            .clinic-info { font-size: 12px; }
            .clinic-name { font-size: 16px; font-weight: 800; color: #1392ec; text-transform: uppercase; margin-bottom: 4px; }
            .clinic-detail { color: #64748b; margin-bottom: 2px; }
            .invoice-meta { text-align: right; font-size: 12px; color: #64748b; }
            .invoice-meta strong { color: #0f172a; }
            .invoice-title { text-align: center; font-size: 20px; font-weight: 900; margin: 30px 0; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; background: #f8fafc; padding: 16px; border-radius: 12px; }
            .info-item { margin-bottom: 8px; }
            .info-item span { color: #64748b; font-weight: 500; }
            .info-item strong { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f1f5f9; padding: 12px 8px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            .summary-table { width: 45%; margin-left: auto; margin-bottom: 40px; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; }
            .summary-total { font-weight: 800; border-top: 2px solid #0f172a; border-bottom: 0; padding-top: 12px; font-size: 16px; color: #1392ec; }
            .footer-signatures { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; page-break-inside: avoid; }
            .signature-box { text-align: center; width: 45%; }
            .signature-title { font-weight: 700; color: #0f172a; }
            .signature-space { height: 100px; }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-info">
              <div class="clinic-name">${t('receipt.clinicName')}</div>
              <div class="clinic-detail">${t('receipt.clinicAddress')}</div>
              <div class="clinic-detail">${t('receipt.clinicPhone')}</div>
            </div>
            <div class="invoice-meta">
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">#${inv.invoiceNumber}</div>
              <div>Ngày tạo: <strong>${formattedDate}</strong></div>
            </div>
          </div>
          
          <hr style="border: 0; border-top: 2px solid #1392ec; margin-bottom: 20px;" />
          
          <div class="invoice-title">${t('receipt.title')}</div>
          
          <div class="info-grid">
            <div>
              <div class="info-item"><span>${t('receipt.patientName')}:</span> <strong>${inv.booking?.patientProfile?.fullName || ''}</strong></div>
              <div class="info-item"><span>${t('receipt.patientCode')}:</span> <strong>${inv.booking?.patientProfile?.patientCode || '-'}</strong></div>
            </div>
            <div>
              <div class="info-item"><span>${t('receipt.doctor')}:</span> <strong>${inv.booking?.doctor?.fullName || t('unknownDoctor')}</strong></div>
              <div class="info-item"><span>${t('receipt.paymentDate')}:</span> <strong>${formattedPaidDate || '-'}</strong></div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>${t('receipt.itemName')}</th>
                <th style="text-align: right; width: 130px;">${t('receipt.price')}</th>
                <th style="text-align: center; width: 60px;">${t('receipt.qty')}</th>
                <th style="text-align: right; width: 130px;">${t('receipt.amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary-table">
            <div class="summary-row">
              <span>${t('receipt.subtotal')}:</span>
              <span style="font-family: monospace;">${formatMoney(inv.subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>${t('receipt.insuranceCovered')}:</span>
              <span style="font-family: monospace;">${formatMoney(inv.insuranceAmount)}</span>
            </div>
            <div class="summary-row">
              <span>${t('receipt.coPayment')}:</span>
              <span style="font-family: monospace;">${formatMoney(inv.patientCoPayment)}</span>
            </div>
            <div class="summary-row summary-total">
              <span>${t('receipt.paidAmount')}:</span>
              <span style="font-family: monospace;">${formatMoney(inv.paidAmount)}</span>
            </div>
            ${
              inv.status === InvoiceStatus.PAID
                ? `
            <div class="summary-row" style="border-bottom: 0; font-size: 11px; color: #64748b; padding-top: 8px;">
              <span>${t('receipt.paymentMethod')}:</span>
              <strong>${methodLabel}</strong>
            </div>
            `
                : ''
            }
          </div>
          
          <div class="footer-signatures">
            <div class="signature-box">
              <div class="signature-title">${t('receipt.signaturePatient')}</div>
              <div class="signature-space"></div>
            </div>
            <div class="signature-box">
              <div class="signature-title">${t('receipt.signatureStaff')}</div>
              <div class="signature-space"></div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(docHtml);
    printWindow.document.close();
  };

  // Reusable flat invoice receipt details component
  const renderInvoiceDetails = (inv: Invoice) => {
    return (
      <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 md:p-7 space-y-6 animate-in fade-in-50 duration-200">
        {/* Receipt Clinic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-850">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('receipt.clinicName')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('receipt.clinicAddress')}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('receipt.clinicPhone')}
            </p>
          </div>
          <div className="text-left md:text-right space-y-1 md:self-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {t('invoiceNumber')}
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
              #{inv.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Receipt Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.patientName')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {inv.booking?.patientProfile?.fullName || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.patientCode')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {inv.booking?.patientProfile?.patientCode || '-'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.doctor')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {inv.booking?.doctor?.fullName || t('unknownDoctor')}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('date')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
              <tr className="border-0">
                <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9">
                  {t('receipt.itemName')}
                </th>
                <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9 text-right">
                  {t('receipt.price')}
                </th>
                <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9 text-center">
                  {t('receipt.qty')}
                </th>
                <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] h-9 text-right">
                  {t('receipt.amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {inv.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatMoney(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost breakdown & actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-6 pt-4 border-t border-slate-200/60 dark:border-slate-800">
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrint(inv);
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              {t('receipt.print')}
            </button>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.subtotal')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-300 tabular-nums">
                {formatMoney(inv.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.insuranceCovered')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-300 tabular-nums">
                {formatMoney(inv.insuranceAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('receipt.coPayment')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-300 tabular-nums">
                {formatMoney(inv.patientCoPayment)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold text-sm">
              <span>{t('receipt.paidAmount')}</span>
              <span className="tabular-nums text-[#1392ec] font-black text-base">
                {formatMoney(inv.paidAmount)}
              </span>
            </div>

            {inv.status === InvoiceStatus.PAID && inv.payments?.[0] && (
              <div className="pt-2 flex flex-col items-end text-right text-[10px] text-slate-400 gap-0.5">
                <div className="flex items-center gap-1 font-semibold">
                  <CreditCard size={10} />
                  <span>
                    {t('receipt.paymentMethod')}: {t(`receipt.${inv.payments[0].paymentMethod.toLowerCase()}`)}
                  </span>
                </div>
                {inv.payments[0].transactionId && (
                  <div className="font-mono text-[9px] opacity-80">
                    {t('receipt.transactionId')}: {inv.payments[0].transactionId}
                  </div>
                )}
                {inv.paidAt && (
                  <div>
                    {t('receipt.paymentDate')}: {format(new Date(inv.paidAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                          <InvoiceTypeBadge type={inv.invoiceType} />
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
                        <StatusBadge status={inv.status} />
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
                          {renderInvoiceDetails(inv)}
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
                        <InvoiceTypeBadge type={inv.invoiceType} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={inv.status} />
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
                    {renderInvoiceDetails(inv)}
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
