'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptIcon, SyringeIcon, StethoscopeIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';
import { Invoice, InvoiceStatus } from '@/lib/api/billing/billing';
import { InvoiceAddServiceForm } from './InvoiceAddServiceForm';

interface InvoiceServiceListProps {
  invoice: Invoice;
  onAddItem?: (itemName: string, unitPrice: number, quantity: number) => Promise<void>;
  onRemoveItem?: (itemId: string) => Promise<void>;
}

export function InvoiceServiceList({ invoice, onAddItem, onRemoveItem }: InvoiceServiceListProps) {
  const t = useTranslations('receptionistBilling.detail');
  const tAdd = useTranslations('receptionistBilling.detail.addService');
  const locale = useLocale();

  const [showAddForm, setShowAddForm] = useState(false);

  const isDraft = invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.OPEN;

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(Number(val));
  };

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReceiptIcon size={20} className="text-slate-500" />
          <h2 className="font-semibold text-slate-800">{t('itemsTitle')}</h2>
        </div>
        {isDraft && onAddItem && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm((v) => !v)}
            className="h-8 gap-1.5 text-xs border-dashed border-[#1392ec] text-[#1392ec] hover:bg-blue-50 cursor-pointer"
          >
            <PlusIcon size={13} weight="bold" />
            {tAdd('addBtn')}
          </Button>
        )}
      </div>

      {/* Add item inline form */}
      {showAddForm && isDraft && onAddItem && (
        <InvoiceAddServiceForm
          onAddItem={onAddItem}
          onClose={() => setShowAddForm(false)}
          t={(key: string) => tAdd(key)}
        />
      )}

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">{t('tables.serviceName')}</th>
              <th className="px-6 py-3 font-semibold text-center">{t('tables.qty')}</th>
              <th className="px-6 py-3 font-semibold text-right">{t('tables.price')}</th>
              <th className="px-6 py-3 font-semibold text-right">{t('tables.total')}</th>
              {isDraft && onRemoveItem && <th className="px-4 py-3 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {invoice.items?.map((item) => {
               const isLabItem = item.isLab || item.labOrderId;
               return (
                 <tr key={item.id} className="hover:bg-slate-50/50">
                   <td className="px-6 py-4 cursor-pointer">
                     <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${isLabItem ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                         {isLabItem ? <SyringeIcon size={16} /> : <StethoscopeIcon size={16} />}
                       </div>
                       <div>
                         <p className="font-medium text-slate-800">{item.itemName}</p>
                         {isLabItem && (
                           <p className="text-[10px] text-amber-600 font-medium">{t('labLabel')}</p>
                         )}
                       </div>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                   <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                   <td className="px-6 py-4 text-right font-medium text-slate-800">{formatCurrency(item.totalPrice)}</td>
                   {isDraft && onRemoveItem && (
                     <td className="px-4 py-4">
                       {!isLabItem && (
                         <button
                           onClick={() => onRemoveItem(item.id)}
                           className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                           title={tAdd('deleteTitle')}
                         >
                           <TrashIcon size={14} weight="bold" />
                         </button>
                       )}
                     </td>
                   )}
                 </tr>
               );
             })}
            <tr className="bg-slate-50">
              <td colSpan={3} className="px-6 py-4 text-right font-semibold text-slate-600">{t('totalLabel')}</td>
              <td className="px-6 py-4 text-right font-bold text-[#1392ec] text-base cursor-pointer">
                {formatCurrency(invoice.totalAmount)}
              </td>
              {isDraft && onRemoveItem && <td />}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
