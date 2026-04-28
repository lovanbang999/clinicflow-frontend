'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Invoice } from '@/lib/api/billing/billing';

export function InvoicePatientInfo({ invoice }: { invoice: Invoice }) {
  const t = useTranslations('receptionistBilling.detail');

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 cursor-pointer">
      <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">{t('patientInfoTitle')}</h3>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-3">
          <span className="text-slate-500 col-span-1">{t('patientLabels.name')}</span>
          <span className="font-medium text-slate-800 col-span-2">{invoice.booking?.patientProfile?.fullName || 'N/A'}</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-slate-500 col-span-1">{t('patientLabels.code')}</span>
          <span className="font-medium text-slate-800 col-span-2">{invoice.booking?.patientProfile?.patientCode || 'N/A'}</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-slate-500 col-span-1">{t('patientLabels.phone')}</span>
          <span className="text-slate-800 col-span-2">{invoice.booking?.patientProfile?.phone || 'N/A'}</span>
        </div>
        <div className="grid grid-cols-3 pt-2 border-t border-slate-50">
          <span className="text-slate-500 col-span-1">{t('patientLabels.doctor')}</span>
          <span className="text-slate-800 col-span-2">{invoice.booking?.doctor?.fullName || 'N/A'}</span>
        </div>
      </div>
    </Card>
  );
}
