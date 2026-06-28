'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PlusIcon, PencilSimpleIcon, Pill } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type AdminMedicine, type AdminCreateMedicineDto, type AdminUpdateMedicineDto } from '@/lib/api/admin/admin-medicines';
import { Textarea } from '@/components/ui/textarea';

interface MedicineForm {
  code: string;
  genericName: string;
  brandName: string;
  concentration: string;
  dosageForm: string;
  defaultUnit: string;
  defaultPrice: string;
  stockQuantity: string;
  registrationNumber: string;
  manufacturerBrand: string;
  country: string;
  imageUrl: string;
  ingredients: string;
  uses: string;
  usage: string;
  sideEffects: string;
  warnings: string;
  notes: string;
  isActive: boolean;
}

const DEFAULT_MEDICINE_FORM: MedicineForm = {
  code: '',
  genericName: '',
  brandName: '',
  concentration: '',
  dosageForm: '',
  defaultUnit: '',
  defaultPrice: '',
  stockQuantity: '0',
  registrationNumber: '',
  manufacturerBrand: '',
  country: '',
  imageUrl: '',
  ingredients: '',
  uses: '',
  usage: '',
  sideEffects: '',
  warnings: '',
  notes: '',
  isActive: true,
};

// Toggle switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        checked ? 'bg-[#1392ec]' : 'bg-[#e2e8f0]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// Field wrapper
function Field({
  label, htmlFor, required, children, error,
}: {
  label: string; htmlFor?: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** null = Add mode, AdminMedicine = Edit mode */
  medicine: AdminMedicine | null;
  onCreate: (dto: AdminCreateMedicineDto) => Promise<void>;
  onUpdate: (id: string, dto: AdminUpdateMedicineDto) => Promise<void>;
};

export function MedicineFormDialog({ open, onOpenChange, medicine, onCreate, onUpdate }: Props) {
  const isEdit = medicine !== null;
  const tAdd = useTranslations('adminMedicines.addMedicine');
  const tEdit = useTranslations('adminMedicines.editMedicine');
  const t = isEdit ? tEdit : tAdd;

  const [form, setForm] = useState<MedicineForm>(DEFAULT_MEDICINE_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof MedicineForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form when open / medicine changes
  useEffect(() => {
    if (open) {
      if (medicine) {
        setForm({
          code: medicine.code,
          genericName: medicine.genericName,
          brandName: medicine.brandName ?? '',
          concentration: medicine.concentration ?? '',
          dosageForm: medicine.dosageForm ?? '',
          defaultUnit: medicine.defaultUnit ?? '',
          defaultPrice: String(medicine.defaultPrice),
          stockQuantity: String(medicine.stockQuantity),
          registrationNumber: medicine.registrationNumber ?? '',
          manufacturerBrand: medicine.manufacturerBrand ?? '',
          country: medicine.country ?? '',
          imageUrl: medicine.imageUrl ?? '',
          ingredients: medicine.ingredients ?? '',
          uses: medicine.uses ?? '',
          usage: medicine.usage ?? '',
          sideEffects: medicine.sideEffects ?? '',
          warnings: medicine.warnings ?? '',
          notes: medicine.notes ?? '',
          isActive: medicine.isActive,
        });
      } else {
        setForm(DEFAULT_MEDICINE_FORM);
      }
      setErrors({});
    }
  }, [open, medicine]);

  const set = <K extends keyof MedicineForm>(k: K, v: MedicineForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof MedicineForm, string>> = {};
    if (!form.code.trim()) e.code = t('errors.codeRequired');
    if (!form.genericName.trim()) e.genericName = t('errors.genericNameRequired');

    const price = parseFloat(form.defaultPrice);
    if (isNaN(price) || price < 0) e.defaultPrice = t('errors.defaultPriceInvalid');

    const stock = parseInt(form.stockQuantity, 10);
    if (isNaN(stock) || stock < 0) e.stockQuantity = t('errors.stockQuantityInvalid');

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: AdminCreateMedicineDto = {
        code: form.code.trim(),
        genericName: form.genericName.trim(),
        brandName: form.brandName.trim() || undefined,
        concentration: form.concentration.trim() || undefined,
        dosageForm: form.dosageForm.trim() || undefined,
        defaultUnit: form.defaultUnit.trim() || undefined,
        defaultPrice: parseFloat(form.defaultPrice),
        stockQuantity: parseInt(form.stockQuantity, 10),
        registrationNumber: form.registrationNumber.trim() || undefined,
        manufacturerBrand: form.manufacturerBrand.trim() || undefined,
        country: form.country.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        ingredients: form.ingredients.trim() || undefined,
        uses: form.uses.trim() || undefined,
        usage: form.usage.trim() || undefined,
        sideEffects: form.sideEffects.trim() || undefined,
        warnings: form.warnings.trim() || undefined,
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      };

      if (isEdit) {
        await onUpdate(medicine!.id, payload);
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch {
      // Errors are handled by hook/api client
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center shrink-0">
              {isEdit ? <PencilSimpleIcon size={20} weight="fill" /> : <PlusIcon size={20} weight="bold" />}
            </div>
            <div>
              <DialogTitle>{t('title')}</DialogTitle>
              {!isEdit && <p className="text-xs text-[#94a3b8]">{tAdd('subtitle')}</p>}
              {isEdit && <p className="text-xs text-[#94a3b8]">{medicine?.genericName}</p>}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Medicine Image Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
            <div className="relative size-24 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-sm shrink-0 flex items-center justify-center">
              {form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt={form.genericName || 'Medicine'}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[#94a3b8]">
                  <Pill size={28} weight="light" className="text-[#94a3b8]" />
                  <span className="text-[10px] font-bold text-slate-400">Chưa có ảnh</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="med-image" className="text-xs font-bold text-slate-700">
                  {t('imageUrl')}
                </Label>
                {form.imageUrl && (
                  <span className="text-[10px] bg-[#1392ec]/10 text-[#1392ec] px-2.5 py-0.5 rounded-full font-bold">
                    Có hình ảnh
                  </span>
                )}
              </div>
              <Input
                id="med-image"
                placeholder={t('imageUrlPlaceholder')}
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] bg-white text-xs"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                Dán URL hình ảnh từ nguồn crawl hoặc website chính thức để hiển thị trong đơn thuốc của bác sĩ và giao diện bán hàng.
              </p>
            </div>
          </div>
          {/* Code + Generic Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('code')} htmlFor="med-code" required error={errors.code}>
              <Input
                id="med-code"
                placeholder={t('codePlaceholder')}
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.code && 'border-red-400')}
                disabled={isEdit} // Do not allow changing the unique medicine code on edit
              />
            </Field>

            <Field label={t('genericName')} htmlFor="med-generic" required error={errors.genericName}>
              <Input
                id="med-generic"
                placeholder={t('genericNamePlaceholder')}
                value={form.genericName}
                onChange={(e) => set('genericName', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.genericName && 'border-red-400')}
              />
            </Field>
          </div>

          {/* Brand Name + Concentration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('brandName')} htmlFor="med-brand">
              <Input
                id="med-brand"
                placeholder={t('brandNamePlaceholder')}
                value={form.brandName}
                onChange={(e) => set('brandName', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>

            <Field label={t('concentration')} htmlFor="med-concentration">
              <Input
                id="med-concentration"
                placeholder={t('concentrationPlaceholder')}
                value={form.concentration}
                onChange={(e) => set('concentration', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>
          </div>

          {/* Dosage Form + Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('dosageForm')} htmlFor="med-dosage">
              <Input
                id="med-dosage"
                placeholder={t('dosageFormPlaceholder')}
                value={form.dosageForm}
                onChange={(e) => set('dosageForm', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>

            <Field label={t('defaultUnit')} htmlFor="med-unit">
              <Input
                id="med-unit"
                placeholder={t('defaultUnitPlaceholder')}
                value={form.defaultUnit}
                onChange={(e) => set('defaultUnit', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('defaultPrice')} htmlFor="med-price" required error={errors.defaultPrice}>
              <Input
                id="med-price"
                type="number"
                min={0}
                placeholder={t('defaultPricePlaceholder')}
                value={form.defaultPrice}
                onChange={(e) => set('defaultPrice', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.defaultPrice && 'border-red-400')}
              />
            </Field>

            <Field label={t('stockQuantity')} htmlFor="med-stock" required error={errors.stockQuantity}>
              <Input
                id="med-stock"
                type="number"
                min={0}
                placeholder={t('stockQuantityPlaceholder')}
                value={form.stockQuantity}
                onChange={(e) => set('stockQuantity', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.stockQuantity && 'border-red-400')}
              />
            </Field>
          </div>

          {/* Registration Number + Manufacturer + Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={t('registrationNumber')} htmlFor="med-reg">
              <Input
                id="med-reg"
                placeholder={t('registrationNumberPlaceholder')}
                value={form.registrationNumber}
                onChange={(e) => set('registrationNumber', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>

            <Field label={t('manufacturerBrand')} htmlFor="med-manufacturer">
              <Input
                id="med-manufacturer"
                placeholder={t('manufacturerBrandPlaceholder')}
                value={form.manufacturerBrand}
                onChange={(e) => set('manufacturerBrand', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>

            <Field label={t('country')} htmlFor="med-country">
              <Input
                id="med-country"
                placeholder={t('countryPlaceholder')}
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>
          </div>

          {/* Ingredients */}
          <Field label={t('ingredients')} htmlFor="med-ingredients">
            <Textarea
              id="med-ingredients"
              rows={2}
              placeholder={t('ingredientsPlaceholder')}
              value={form.ingredients}
              onChange={(e) => set('ingredients', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Uses */}
          <Field label={t('uses')} htmlFor="med-uses">
            <Textarea
              id="med-uses"
              rows={2}
              placeholder={t('usesPlaceholder')}
              value={form.uses}
              onChange={(e) => set('uses', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Usage Instructions */}
          <Field label={t('usage')} htmlFor="med-usage">
            <Textarea
              id="med-usage"
              rows={2}
              placeholder={t('usagePlaceholder')}
              value={form.usage}
              onChange={(e) => set('usage', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Side Effects */}
          <Field label={t('sideEffects')} htmlFor="med-side">
            <Textarea
              id="med-side"
              rows={2}
              placeholder={t('sideEffectsPlaceholder')}
              value={form.sideEffects}
              onChange={(e) => set('sideEffects', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Warnings */}
          <Field label={t('warnings')} htmlFor="med-warnings">
            <Textarea
              id="med-warnings"
              rows={2}
              placeholder={t('warningsPlaceholder')}
              value={form.warnings}
              onChange={(e) => set('warnings', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Notes */}
          <Field label={t('notes')} htmlFor="med-notes">
            <Textarea
              id="med-notes"
              rows={2}
              placeholder={t('notesPlaceholder')}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
            <div>
              <p className="text-sm font-semibold text-[#111518]">{t('status')}</p>
              <p className="text-xs text-[#64748b] mt-0.5">{t('statusDesc')}</p>
            </div>
            <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#f0f3f4]">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-[#64748b] border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer bg-white"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#1392ec] text-white rounded-xl text-sm font-semibold hover:bg-[#1180d0] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <><span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{t('saving')}</>
            ) : (
              <>{t('save')}</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
