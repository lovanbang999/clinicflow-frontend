'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBilling } from '@/lib/hooks/useBilling';
import { InvoiceStatus, PaymentMethod } from '@/lib/api/billing';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CaretLeftIcon,
  MoneyIcon,
  PrinterIcon,
  StethoscopeIcon,
  TestTubeIcon,
  PillIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentModal } from '@/components/dashboard/billing/PaymentModal';
import { InvoiceServiceList } from '@/components/dashboard/billing/InvoiceServiceList';
import { InvoicePaymentHistory } from '@/components/dashboard/billing/InvoicePaymentHistory';
import { InvoiceSummary } from '@/components/dashboard/billing/InvoiceSummary';
import { InvoicePatientInfo } from '@/components/dashboard/billing/InvoicePatientInfo';
import { PrintableInvoice } from '@/components/dashboard/billing/PrintableInvoice';
import { InvoiceStatusBadge } from '@/components/dashboard/billing/InvoiceStatusBadge';
import { useTranslations, useLocale } from 'next-intl';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations('receptionistBilling');
  const tTypes = useTranslations('receptionistBilling.bookingInvoices.types');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  
  const { currentInvoice, loadingInvoice, fetchInvoiceById, addPayment, addItemToInvoice, removeItemFromInvoice } = useBilling();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceById(id);
    }
  }, [id, fetchInvoiceById]);

  if (loadingInvoice || !currentInvoice) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  const handlePaymentSubmit = async (
    amount: number,
    method: PaymentMethod,
    labOrderId?: string,
    insuranceCovered?: number,
    insuranceNumber?: string,
  ) => {
    await addPayment(currentInvoice.id, {
      amountPaid: amount,
      paymentMethod: method,
      labOrderId,
      insuranceCovered,
      insuranceNumber,
    });
    fetchInvoiceById(currentInvoice.id); // refresh
  };

  // Map InvoiceType to icon + label
  const invoiceTypeContent: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    CONSULTATION: { label: tTypes('CONSULTATION'), icon: <StethoscopeIcon size={14} weight="bold" />, color: 'text-blue-600 bg-blue-50' },
    LAB:          { label: tTypes('LAB'), icon: <TestTubeIcon size={14} weight="bold" />, color: 'text-violet-600 bg-violet-50' },
    PHARMACY:     { label: tTypes('PHARMACY'), icon: <PillIcon size={14} weight="bold" />, color: 'text-emerald-600 bg-emerald-50' },
  };
  const typeInfo = invoiceTypeContent[currentInvoice.invoiceType] ?? { label: currentInvoice.invoiceType, icon: null, color: 'text-slate-600 bg-slate-50' };


  return (
    <div className="mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/receptionist/billing')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <CaretLeftIcon size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              {t('detail.title')} <span className="text-[#1392ec] cursor-pointer">#{currentInvoice.invoiceNumber}</span>
            </h1>
            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              {t('detail.status')} <InvoiceStatusBadge status={currentInvoice.status} />
              <span className="text-slate-300">|</span>
              {t('detail.createdAt')} {format(new Date(currentInvoice.createdAt), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* InvoiceType badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
            {typeInfo.icon}
            {typeInfo.label}
          </span>

          {currentInvoice.status === InvoiceStatus.PAID && (
            <Button
              variant="outline"
              className="hidden sm:flex border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
              onClick={() => window.print()}
            >
              <PrinterIcon size={18} className="mr-2" /> {t('detail.printBtn')}
            </Button>
          )}

          {currentInvoice.status !== InvoiceStatus.PAID && currentInvoice.status !== InvoiceStatus.CANCELLED && (
            <Button
              onClick={() => setPaymentModalOpen(true)}
              className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer"
            >
              <MoneyIcon size={18} weight="bold" className="mr-2" />
              {t('detail.payBtn')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Payments */}
        <div className="lg:col-span-2 space-y-6">
          <InvoiceServiceList
            invoice={currentInvoice}
            onAddItem={async (itemName, unitPrice, quantity) => {
              await addItemToInvoice(currentInvoice.id, { itemName, unitPrice, quantity });
              fetchInvoiceById(currentInvoice.id);
            }}
            onRemoveItem={async (itemId) => {
              await removeItemFromInvoice(currentInvoice.id, itemId);
              fetchInvoiceById(currentInvoice.id);
            }}
          />
          <InvoicePaymentHistory invoice={currentInvoice} />
        </div>

        {/* Right Column: Summary & Patient Info */}
        <div className="space-y-6">
          <InvoiceSummary invoice={currentInvoice} />
          <InvoicePatientInfo invoice={currentInvoice} />
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={currentInvoice}
        onPaymentSubmitted={handlePaymentSubmit}
      />

      {/* Hidden area for printing only */}
      <PrintableInvoice invoice={currentInvoice} />
    </div>
  );
}
