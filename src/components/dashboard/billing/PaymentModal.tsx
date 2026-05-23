'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentMethod, Invoice } from '@/lib/api/billing/billing';
import { SpinnerIcon, MoneyIcon, ShieldCheckIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface InsuranceFields {
  insuranceNumber: string;
  insuranceCovered: number | '';
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  /**
   * Called with full payment data — now includes optional insurance fields.
   * Caller (useBilling) must forward insuranceCovered + insuranceNumber to API.
   */
  onPaymentSubmitted: (
    amount: number,
    method: PaymentMethod,
    labOrderId?: string,
    insuranceCovered?: number,
    insuranceNumber?: string,
  ) => Promise<void>;
}

export function PaymentModal({ isOpen, onClose, invoice, onPaymentSubmitted }: PaymentModalProps) {
  const t = useTranslations('receptionistBilling.paymentModal');
  const locale = useLocale();

  const [amount, setAmount] = useState<number | ''>('');
  const [amountGiven, setAmountGiven] = useState<number | ''>('');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedLabOrderId, setSelectedLabOrderId] = useState<string>('');
  const [insurance, setInsurance] = useState<InsuranceFields>({ insuranceNumber: '', insuranceCovered: '' });
  const [isSubmitting, setSubmitting] = useState(false);

  const isInsuranceMethod = method === PaymentMethod.INSURANCE;
  const labItems = invoice.items?.filter(item => item.isLab && item.labOrderId) || [];

  const totalAmount = Number(invoice.totalAmount || 0);
  const paidAmount = Number(invoice.paidAmount || 0);
  const remainingGlobal = totalAmount - paidAmount;

  // Auto-compute: if INSURANCE, total amount = insurance covered + patient co-pay
  // The "amount" field represents the FULL invoice amount being paid in this transaction.
  const insuranceCoveredNum = isInsuranceMethod ? (Number(insurance.insuranceCovered) || 0) : 0;
  const patientCoPay = isInsuranceMethod && amount !== ''
    ? Math.max(0, Number(amount) - insuranceCoveredNum)
    : null;

  // Reset insurance fields when switching away from INSURANCE method
  useEffect(() => {
    if (!isInsuranceMethod) {
      setInsurance({ insuranceNumber: '', insuranceCovered: '' });
    }
  }, [isInsuranceMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    try {
      setSubmitting(true);
      await onPaymentSubmitted(
        Number(amount),
        method,
        selectedLabOrderId || undefined,
        isInsuranceMethod ? insuranceCoveredNum : undefined,
        isInsuranceMethod && insurance.insuranceNumber ? insurance.insuranceNumber : undefined,
      );
      onClose();
    } catch {
      // toast is handled in useBilling or parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillRemaining = () => {
    if (selectedLabOrderId) {
      const item = labItems.find(i => i.labOrderId === selectedLabOrderId);
      if (item) setAmount(Number(item.totalPrice));
    } else {
      setAmount(remainingGlobal > 0 ? remainingGlobal : 0);
    }
  };

  const formatCurrency = (val: number | string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: locale === 'vi' ? 'VND' : 'USD',
    }).format(Number(val));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl cursor-default">
            <MoneyIcon size={24} className="text-[#1392ec]" weight="duotone" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Invoice Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
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

          <div className="space-y-3 px-1">
            {/* Lab order selector */}
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
                      {item.itemName} — {formatCurrency(item.totalPrice)} {t('labRemaining')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment method */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{t('methodLabel')}</label>
              <select
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#1392ec]/20 outline-none cursor-pointer"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value={PaymentMethod.CASH}>{t('methods.CASH')}</option>
                <option value={PaymentMethod.CARD}>{t('methods.CARD')}</option>
                <option value={PaymentMethod.BANK_TRANSFER}>{t('methods.BANK_TRANSFER')}</option>
                <option value={PaymentMethod.INSURANCE}>{t('methods.INSURANCE')}</option>
              </select>
            </div>

            {/* BHYT Insurance Section — slides in when INSURANCE is selected */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                isInsuranceMethod ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
              )}
            >
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1392ec]">
                  <ShieldCheckIcon size={16} weight="duotone" />
                  {t('insuranceSection')}
                </div>

                {/* Insurance card number */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">{t('insuranceNumberLabel')}</label>
                  <Input
                    type="text"
                    value={insurance.insuranceNumber}
                    onChange={(e) => setInsurance(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                    placeholder={t('insuranceNumberPlaceholder')}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Insurance covered amount */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">{t('insuranceCoveredLabel')}</label>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={insurance.insuranceCovered}
                    onChange={(e) =>
                      setInsurance(prev => ({
                        ...prev,
                        insuranceCovered: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                    placeholder={t('insuranceCoveredPlaceholder')}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Patient co-pay preview */}
                {patientCoPay !== null && (
                  <div className="flex justify-between items-center pt-1 border-t border-blue-100">
                    <span className="text-xs text-slate-600">{t('patientCoPayLabel')}</span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        patientCoPay < 0 ? 'text-red-500' : 'text-slate-800',
                      )}
                    >
                      {formatCurrency(patientCoPay)}
                      {patientCoPay < 0 && (
                        <WarningCircleIcon size={14} className="inline ml-1 text-red-500" weight="fill" />
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Total amount input */}
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
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setAmount(val);
                    if (val && amountGiven && amountGiven < val) {
                       setAmountGiven(val);
                    }
                  }}
                  placeholder="0"
                  className="pl-4 pr-16 h-12 text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={handleFillRemaining}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 text-xs font-semibold text-[#1392ec] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  title={t('fullPaymentHint')}
                >
                  {t('fullPaymentShortcut')}
                </button>
              </div>
            </div>

            {/* Cash Return Calculation */}
            {method === PaymentMethod.CASH && amount !== '' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Khách đưa</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amountGiven}
                      onChange={(e) => setAmountGiven(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={amount.toString()}
                      className="h-10 text-base font-bold bg-white"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">VND</div>
                  </div>
                </div>

                {amountGiven !== '' && Number(amountGiven) > Number(amount) && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiền thừa trả khách</span>
                    <span className="text-lg font-black text-emerald-600 tracking-tight">
                      {Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amountGiven) - Number(amount))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 mt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              {t('cancelBtn')}
            </Button>
            <Button
              type="submit"
              disabled={!amount || amount <= 0 || isSubmitting}
              className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer"
            >
              {isSubmitting && <SpinnerIcon className="animate-spin mr-2" />}
              {isSubmitting ? t('processing') : t('submitBtn')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
