'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentMethod, Invoice } from '@/lib/api/billing';
import { SpinnerIcon, MoneyIcon } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentSubmitted: (amount: number, method: PaymentMethod, labOrderId?: string) => Promise<void>;
}

export function PaymentModal({ isOpen, onClose, invoice, onPaymentSubmitted }: PaymentModalProps) {
  const t = useTranslations('dashboard.receptionist.billingManagement.paymentModal');
  const locale = useLocale();

  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedLabOrderId, setSelectedLabOrderId] = useState<string>('');
  const [isSubmiting, setSubmiting] = useState(false);

  // lab items that are not fully paid
  const labItems = invoice.items?.filter(item => item.isLab && item.labOrderId) || [];
  
  const totalAmount = Number(invoice.totalAmount);
  const paidAmount = Number(invoice.paidAmount);
  const remainingGlobal = totalAmount - paidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    
    try {
      setSubmiting(true);
      await onPaymentSubmitted(amount, method, selectedLabOrderId || undefined);
      onClose();
    } catch {
      // toast is handled in useBilling or parent
    } finally {
      setSubmiting(false);
    }
  };

  const handleFillRemaining = () => {
    if (selectedLabOrderId) {
      const item = labItems.find(i => i.labOrderId === selectedLabOrderId);
      if (item) setAmount(Number(item.totalPrice)); // Simplified, ideally check item's individual paid amount if supported
    } else {
      setAmount(remainingGlobal > 0 ? remainingGlobal : 0);
    }
  };

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(Number(val));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl cursor-default">
            <MoneyIcon size={24} className="text-[#1392ec]" weight="duotone" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 cursor-pointer">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('desc')}</span>
              <span className="font-semibold text-slate-800">#{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('totalAmount')}</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('paidAmount')}</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-slate-200 font-bold">
              <span className="text-slate-700">{t('remaining')}</span>
              <span className="text-red-500">{formatCurrency(remainingGlobal)}</span>
            </div>
          </div>

          <div className="space-y-3 p-1">
            {labItems.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('applyToLabOrderId')}</label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#1392ec]/20 outline-none cursor-pointer"
                  value={selectedLabOrderId}
                  onChange={(e) => {
                    setSelectedLabOrderId(e.target.value);
                    if (e.target.value) {
                      const item = labItems.find(i => i.labOrderId === e.target.value);
                      if (item) setAmount(Number(item.totalPrice));
                    }
                  }}
                >
                  <option value="">{t('selectLabService')}</option>
                  {labItems.map(item => (
                    <option key={item.id} value={item.labOrderId}>
                      {item.name} - {formatCurrency(item.totalPrice)} {t('labRemaining')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                {t('payAmountLabel')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                  className="pl-4 pr-16 h-12 text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={handleFillRemaining}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 text-xs font-semibold text-[#1392ec] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  title={t('fullPaymentHint')}
                >
                  Tất cả
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{t('methodLabel')}</label>
              <select
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#1392ec]/20 outline-none cursor-pointer"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value={PaymentMethod.CASH}>{t('methods.CASH')}</option>
                <option value={PaymentMethod.CREDIT_CARD}>{t('methods.CREDIT_CARD')}</option>
                <option value={PaymentMethod.BANK_TRANSFER}>{t('methods.BANK_TRANSFER')}</option>
                <option value={PaymentMethod.E_WALLET}>{t('methods.E_WALLET')}</option>
                <option value={PaymentMethod.INSURANCE}>{t('methods.INSURANCE')}</option>
              </select>
            </div>
          </div>

        </form>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="cursor-pointer"
          >
            {t('cancelBtn')}
          </Button>
          <Button 
            disabled={!amount || amount <= 0 || isSubmiting}
            onClick={handleSubmit} 
            className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer"
          >
            {isSubmiting ? <SpinnerIcon className="animate-spin mr-2" /> : null}
            {isSubmiting ? t('processing') : t('submitBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
