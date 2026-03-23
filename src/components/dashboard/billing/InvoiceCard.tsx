import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { Invoice, InvoiceType, InvoiceStatus } from '@/lib/api/billing';
import { Button } from '@/components/ui/button';
import { InvoiceStatusBadge } from '@/components/dashboard/billing/InvoiceStatusBadge';
import {
  StethoscopeIcon,
  TestTubeIcon,
  PillIcon,
  EyeIcon,
  CheckCircleIcon,
  PrinterIcon,
  TicketIcon,
} from '@phosphor-icons/react';

function formatVND(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

export function InvoiceCard({
  invoice,
  onPay,
  onView,
  onPrintInvoice,
  onPrintTicket,
}: {
  invoice: Invoice;
  onPay: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onPrintTicket: (invoice: Invoice) => void;
}) {
  const t = useTranslations('dashboard.receptionist.billingManagement.bookingInvoices');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const INVOICE_TYPE_CONFIG: Record<
    InvoiceType,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    [InvoiceType.CONSULTATION]: {
      label: t('types.CONSULTATION'),
      icon: <StethoscopeIcon size={16} weight="bold" />,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    [InvoiceType.LAB]: {
      label: t('types.LAB'),
      icon: <TestTubeIcon size={16} weight="bold" />,
      color: 'text-violet-700 bg-violet-50 border-violet-200',
    },
    [InvoiceType.PHARMACY]: {
      label: t('types.PHARMACY'),
      icon: <PillIcon size={16} weight="bold" />,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  };

  const typeConfig = INVOICE_TYPE_CONFIG[invoice.invoiceType];
  const isPaid = invoice.status === InvoiceStatus.PAID;
  const isCancelled = invoice.status === InvoiceStatus.CANCELLED;

  return (
    <div
      className={`rounded-xl border-2 p-5 transition-all ${
        isPaid
          ? 'border-emerald-200 bg-emerald-50/30'
          : isCancelled
          ? 'border-slate-100 bg-slate-50/50 opacity-60'
          : 'border-slate-200 bg-white hover:border-[#1392ec]/40 hover:shadow-md'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${typeConfig?.color}`}
          >
            {typeConfig?.icon}
            {typeConfig?.label ?? invoice.invoiceType}
          </span>
          <div>
            <p className="font-bold text-slate-800 text-sm">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-400">
              {format(new Date(invoice.createdAt), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}
            </p>
          </div>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {/* Items summary */}
      {invoice.items.length > 0 && (
        <div className="mb-4 space-y-1">
          {invoice.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-600 truncate max-w-[70%]">{item.itemName}</span>
              <span className="text-slate-700 font-medium">{formatVND(Number(item.totalPrice))}</span>
            </div>
          ))}
          {invoice.items.length > 3 && (
            <p className="text-xs text-slate-400 italic">
              {t('otherServices', { count: invoice.items.length - 3 })}
            </p>
          )}
        </div>
      )}

      {/* Total + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">{t('totalAmount')}</p>
          <p className="text-lg font-bold text-[#1392ec]">{formatVND(Number(invoice.totalAmount))}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(invoice)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
            title={t('viewDetails')}
          >
            <EyeIcon size={16} weight="bold" />
          </button>

          {!isPaid && !isCancelled && (
            <Button
              size="sm"
              onClick={() => onPay(invoice)}
              className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer h-8 px-3 text-xs"
            >
              {t('pay')}
            </Button>
          )}

          {isPaid && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mr-1">
                <CheckCircleIcon size={16} weight="fill" />
                {t('paid')}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrintInvoice(invoice)}
                className="h-8 px-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer"
              >
                <PrinterIcon size={14} />
                {t('printInvoice')}
              </Button>
              {invoice.invoiceType === InvoiceType.CONSULTATION && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPrintTicket(invoice)}
                  className="h-8 px-2 text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 gap-1.5 cursor-pointer"
                >
                  <TicketIcon size={14} />
                  {t('printTicket')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
