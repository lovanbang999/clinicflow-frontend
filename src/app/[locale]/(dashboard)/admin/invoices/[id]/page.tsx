'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { billingApi, Invoice } from '@/lib/api/billing';
import { useState, useEffect, useCallback } from 'react';
import { InvoiceCard } from '@/components/dashboard/billing/InvoiceCard';
import { InvoiceServiceList } from '@/components/dashboard/billing/InvoiceServiceList';
import { InvoicePaymentHistory } from '@/components/dashboard/billing/InvoicePaymentHistory';
import { InvoicePatientInfo } from '@/components/dashboard/billing/InvoicePatientInfo';
import { InvoiceSummary } from '@/components/dashboard/billing/InvoiceSummary';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('adminInvoices.detail');
  
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const result = await billingApi.getInvoiceById(invoiceId);
      setInvoice(result);
    } catch (err) {
      console.error('[AdminInvoiceDetail]', err);
      toast.error(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [invoiceId, t]);

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [fetchInvoice, invoiceId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">{t('notFound')}</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#1392ec] underline cursor-pointer">{t('back')}</button>
      </div>
    );
  }

  // NOP handlers for InvoiceCard as Admin should just view
  const handleNoop = () => {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeftIcon size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-slate-500">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="cursor-pointer">
            <InvoiceCard 
              invoice={invoice} 
              onPay={handleNoop}
              onView={handleNoop}
              onPrintInvoice={handleNoop}
              onPrintTicket={handleNoop}
            />
          </div>
          <InvoiceServiceList invoice={invoice} />
          <InvoicePaymentHistory invoice={invoice} />
        </div>

        <div className="space-y-6">
          <InvoicePatientInfo invoice={invoice} />
          <InvoiceSummary invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
