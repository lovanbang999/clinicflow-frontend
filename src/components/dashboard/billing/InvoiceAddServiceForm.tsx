'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InvoiceAddServiceFormProps {
  onAddItem: (itemName: string, unitPrice: number, quantity: number) => Promise<void>;
  onClose: () => void;
  t: (key: string) => string;
}

export function InvoiceAddServiceForm({ onAddItem, onClose, t }: InvoiceAddServiceFormProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemPrice) return;
    setIsAdding(true);
    try {
      await onAddItem(newItemName.trim(), Number(newItemPrice), Number(newItemQty) || 1);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemQty('1');
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="px-6 py-4 bg-blue-50/40 border-b border-blue-100 space-y-3">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t('formTitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{t('nameLabel')}</label>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="h-9 text-sm"
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-slate-500 mb-1 block">{t('priceLabel')}</label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            placeholder={t('pricePlaceholder')}
            className="h-9 text-sm"
          />
        </div>
        <div className="w-16">
          <label className="text-xs text-slate-500 mb-1 block">{t('qtyLabel')}</label>
          <Input
            type="number"
            min={1}
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-8 text-xs cursor-pointer"
        >
          {t('cancelBtn')}
        </Button>
        <Button
          size="sm"
          disabled={!newItemName.trim() || !newItemPrice || isAdding}
          onClick={handleAddItem}
          className="h-8 text-xs bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer"
        >
          {isAdding ? t('addingBtn') : t('confirmBtn')}
        </Button>
      </div>
    </div>
  );
}
