'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  InvoiceType,
  LabOrderForBilling,
  AddInvoiceItemDto,
} from '@/lib/api/billing';
import { useTranslations, useLocale } from 'next-intl';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  TestTubeIcon,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';

interface QuickAddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceType: InvoiceType;
  pendingLabOrders: LabOrderForBilling[];
  onSubmit: (labOrderIds: string[], items: AddInvoiceItemDto[]) => Promise<void>;
  isSubmitting: boolean;
}

export function QuickAddInvoiceModal({
  isOpen,
  onClose,
  invoiceType,
  pendingLabOrders,
  onSubmit,
  isSubmitting,
}: QuickAddInvoiceModalProps) {
  const t = useTranslations('dashboard.receptionist.billingManagement.bookingInvoices.quickAddModal');
  const locale = useLocale();

  const [selectedLabOrderIds, setSelectedLabOrderIds] = useState<Set<string>>(new Set());
  const [manualItems, setManualItems] = useState<AddInvoiceItemDto[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Free text / service add form
  const [newItemName, setNewItemName] = useState('');
  const [newUnitPrice, setNewUnitPrice] = useState<number | ''>('');
  const [newQuantity, setNewQuantity] = useState<number | ''>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (invoiceType === InvoiceType.LAB) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedLabOrderIds(new Set(pendingLabOrders.map((o) => o.id)));
      } else {
        setSelectedLabOrderIds(new Set());
      }
      setManualItems([]);
      setNewItemName('');
      setNewUnitPrice('');
      setNewQuantity(1);
      setSelectedServiceId('');

      if (invoiceType !== InvoiceType.PHARMACY) {
        servicesApi.getAll({ isActive: true }).then(setServices).catch(console.error);
      }
    }
  }, [isOpen, invoiceType, pendingLabOrders]);

  const toggleLabOrder = (id: string) => {
    setSelectedLabOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddManualItem = () => {
    if (!newItemName || !newUnitPrice || !newQuantity) return;
    setManualItems((prev) => [
      ...prev,
      {
        itemName: newItemName,
        unitPrice: Number(newUnitPrice),
        quantity: Number(newQuantity),
        serviceId: selectedServiceId || undefined,
        sortOrder: 100 + prev.length,
      },
    ]);
    setNewItemName('');
    setNewUnitPrice('');
    setNewQuantity(1);
    setSelectedServiceId('');
  };

  const handleRemoveManualItem = (index: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceSelect = (val: string) => {
    setSelectedServiceId(val);
    if (val) {
      const svc = services.find((s) => s.id === val);
      if (svc) {
        setNewItemName(svc.name);
        setNewUnitPrice(svc.price);
      }
    } else {
      setNewItemName('');
      setNewUnitPrice('');
    }
  };

  const formatCurrency = (val: number | string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: locale === 'vi' ? 'VND' : 'USD',
    }).format(Number(val));

  const handleSubmit = async () => {
    await onSubmit(Array.from(selectedLabOrderIds), manualItems);
  };

  const getTitle = () => {
    switch (invoiceType) {
      case InvoiceType.CONSULTATION: return t('titleConsultation');
      case InvoiceType.LAB: return t('titleLab');
      case InvoiceType.PHARMACY: return t('titlePharmacy');
      default: return t('titleDefault');
    }
  };

  const hasPendingOrders = invoiceType === InvoiceType.LAB && pendingLabOrders.length > 0;
  const isFormValid = selectedLabOrderIds.size > 0 || manualItems.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-4 bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-900">{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Pending Orders (LAB only) */}
          {invoiceType === InvoiceType.LAB && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                {t('pendingOrders', { count: pendingLabOrders.length })}
              </h3>
              {hasPendingOrders ? (
                <Card className="border p-3 space-y-2 bg-slate-50/50">
                  {pendingLabOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => toggleLabOrder(order.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            selectedLabOrderIds.has(order.id)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedLabOrderIds.has(order.id) && <CheckCircleIcon weight="bold" size={14} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                            <TestTubeIcon size={14} className="text-blue-500" />
                            {order.testName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              ) : (
                <p className="text-sm text-slate-400 italic">{t('emptyPending')}</p>
              )}
            </div>
          )}

          {/* Section 2: Manual Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex justify-between items-center">
              <span>
                {invoiceType === InvoiceType.CONSULTATION && t('manualItemsConsultation')}
                {invoiceType === InvoiceType.LAB && t('manualItemsLab')}
                {invoiceType === InvoiceType.PHARMACY && t('manualItemsPharmacy')}
              </span>
            </h3>

            {/* Added Manual Items List */}
            {manualItems.length > 0 && (
              <div className="space-y-2 mb-4">
                {manualItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-700">{item.itemName}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-blue-700">
                        {formatCurrency(Number(item.quantity) * Number(item.unitPrice))}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveManualItem(idx)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add manual item form */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-4">
              {invoiceType !== InvoiceType.PHARMACY && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('searchService')}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedServiceId}
                    onChange={(e) => handleServiceSelect(e.target.value)}
                  >
                    <option value="">{t('selectService')}</option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} - {formatCurrency(svc.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs">
                    {invoiceType === InvoiceType.CONSULTATION && t('itemNameConsultation')}
                    {invoiceType === InvoiceType.LAB && t('itemNameLab')}
                    {invoiceType === InvoiceType.PHARMACY && t('itemNamePharmacy')}
                  </Label>
                  <Input
                    placeholder={t('itemNamePlaceholder')}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('quantity')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('price')}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 mt-2"
                onClick={handleAddManualItem}
                disabled={!newItemName || !newUnitPrice || !newQuantity}
              >
                <PlusIcon className="mr-2" size={14} /> {t('addBtn')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
