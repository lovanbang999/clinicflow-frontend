'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  PillIcon,
  InfoIcon,
  ClipboardTextIcon,
  ClockIcon,
  MoneyIcon,
  WarningCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type AdminMedicine } from '@/lib/api/admin/admin-medicines';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  medicine: AdminMedicine | null;
};

export function MedicineDetailDialog({ open, onOpenChange, medicine }: Props) {
  const t = useTranslations('adminMedicines.viewMedicine');
  const [activeTab, setActiveTab] = useState<'general' | 'clinical' | 'safety'>('general');

  if (!medicine) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isOutOfStock = medicine.stockQuantity <= 0;
  const isLowStock = medicine.stockQuantity > 0 && medicine.stockQuantity < 50;

  const tabs = [
    { id: 'general', label: t('tabGeneral'), icon: PillIcon },
    { id: 'clinical', label: t('tabClinical'), icon: ClipboardTextIcon },
    { id: 'safety', label: t('tabSafety'), icon: WarningCircleIcon },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col h-[85vh] sm:h-auto max-h-[85vh]">
        {/* Header Section */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Medicine Image / Icon */}
              <div className="relative size-16 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                {medicine.imageUrl ? (
                  <Image
                    src={medicine.imageUrl}
                    alt={medicine.genericName}
                    fill
                    className="object-contain p-1.5"
                    unoptimized
                  />
                ) : (
                  <div className="bg-blue-50 text-[#1392ec] size-full flex items-center justify-center">
                    <PillIcon size={32} weight="light" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-bold text-slate-800 flex flex-wrap items-center gap-2 leading-snug">
                  <span>{medicine.genericName}</span>
                  {medicine.concentration && (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-150 px-2 py-0.5 rounded-md border border-slate-200">
                      {medicine.concentration}
                    </span>
                  )}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-x-2 mt-1.5 text-xs text-slate-500">
                  <span className="font-bold text-[#1392ec] bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded">
                    {medicine.code}
                  </span>
                  {medicine.brandName && (
                    <span className="truncate max-w-[250px] font-medium" title={medicine.brandName}>
                      • {medicine.brandName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="sm:self-center shrink-0">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border',
                  medicine.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200',
                )}
              >
                <span className={cn('size-1.5 rounded-full', medicine.isActive ? 'bg-emerald-500' : 'bg-slate-400')} />
                {medicine.isActive ? t('statusActive') : t('statusInactive')}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Custom Tab Selector */}
        <div className="px-6 bg-slate-50 border-b border-slate-100 shrink-0 flex gap-4 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none',
                  isActive
                    ? 'border-[#1392ec] text-[#1392ec]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                <TabIcon size={18} weight={isActive ? 'fill' : 'regular'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-[350px]">
          {/* Tab 1: General Info */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Price & Stock highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-100/50">
                  <div className="p-3 bg-blue-50 text-[#1392ec] rounded-xl shrink-0">
                    <MoneyIcon size={22} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('defaultPrice')}
                    </p>
                    <p className="text-lg font-extrabold text-[#1392ec] truncate">
                      {formatPrice(medicine.defaultPrice)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-slate-100/50">
                  <div className={cn(
                    "p-3 rounded-xl shrink-0",
                    isOutOfStock 
                      ? "bg-rose-50 text-rose-500" 
                      : isLowStock 
                        ? "bg-amber-50 text-amber-500" 
                        : "bg-emerald-50 text-emerald-500"
                  )}>
                    <PillIcon size={22} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('stockQuantity')}
                    </p>
                    <p className={cn(
                      "text-lg font-extrabold truncate",
                      isOutOfStock 
                        ? "text-rose-600" 
                        : isLowStock 
                          ? "text-amber-600" 
                          : "text-emerald-600"
                    )}>
                      {medicine.stockQuantity} {medicine.defaultUnit || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('code')}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                      {medicine.code}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('concentration')}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                      {medicine.concentration || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('dosageForm')}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                      {medicine.dosageForm || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('defaultUnit')}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                      {medicine.defaultUnit || '—'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('registrationNumber')}
                    </span>
                    <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                      {medicine.registrationNumber || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('country')}
                    </span>
                    <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
                      {medicine.country || '—'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('brandName')}
                    </span>
                    <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 leading-normal">
                      {medicine.brandName || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('manufacturerBrand')}
                    </span>
                    <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 leading-normal">
                      {medicine.manufacturerBrand || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Clinical Instructions */}
          {activeTab === 'clinical' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Ingredients Card */}
              {medicine.ingredients && medicine.ingredients.trim() ? (
                <div className="border-l-4 border-l-blue-500 bg-slate-50/50 p-4 rounded-r-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <PillIcon size={14} className="text-[#1392ec]" />
                    {t('ingredients')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {medicine.ingredients}
                  </p>
                </div>
              ) : null}

              {/* Uses Card */}
              {medicine.uses && medicine.uses.trim() ? (
                <div className="border-l-4 border-l-blue-500 bg-slate-50/50 p-4 rounded-r-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardTextIcon size={14} className="text-[#1392ec]" />
                    {t('uses')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {medicine.uses}
                  </p>
                </div>
              ) : null}

              {/* Usage & Dosage Card */}
              {medicine.usage && medicine.usage.trim() ? (
                <div className="border-l-4 border-l-blue-500 bg-slate-50/50 p-4 rounded-r-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ClockIcon size={14} className="text-[#1392ec]" />
                    {t('usage')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {medicine.usage}
                  </p>
                </div>
              ) : null}

              {/* Fallback if no clinical data exists */}
              {!medicine.ingredients && !medicine.uses && !medicine.usage && (
                <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                  <ClipboardTextIcon size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">
                    Chưa cập nhật thông tin chỉ định lâm sàng cho loại thuốc này.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Safety & Notes */}
          {activeTab === 'safety' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Warnings Card */}
              {medicine.warnings && medicine.warnings.trim() ? (
                <div className="border-l-4 border-l-rose-500 bg-rose-50/30 p-4 rounded-r-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                    <WarningIcon size={14} className="text-rose-500" />
                    {t('warnings')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {medicine.warnings}
                  </p>
                </div>
              ) : null}

              {/* Side Effects Card */}
              {medicine.sideEffects && medicine.sideEffects.trim() ? (
                <div className="border-l-4 border-l-amber-500 bg-amber-50/30 p-4 rounded-r-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                    <WarningCircleIcon size={14} className="text-amber-500" />
                    {t('sideEffects')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {medicine.sideEffects}
                  </p>
                </div>
              ) : null}

              {/* Additional Notes */}
              {medicine.notes && medicine.notes.trim() ? (
                <div className="border-l-4 border-l-slate-400 bg-slate-50/50 p-4 rounded-r-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <InfoIcon size={14} className="text-slate-400" />
                    {t('notes')}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {medicine.notes}
                  </p>
                </div>
              ) : null}

              {/* Fallback if no safety data exists */}
              {!medicine.warnings && !medicine.sideEffects && !medicine.notes && (
                <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                  <WarningCircleIcon size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">
                    Không có cảnh báo đặc biệt hoặc ghi chú thêm nào cho loại thuốc này.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer bg-white"
          >
            {t('close')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
