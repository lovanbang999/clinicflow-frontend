'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, PencilSimpleIcon, UserIcon } from '@phosphor-icons/react';
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
import { type Service, type ServiceForm, DEFAULT_SERVICE_FORM } from './types';
import { type AdminCreateServiceDto, type AdminUpdateServiceDto } from '@/lib/api/admin-services';
import { useAdminCategories } from '@/lib/hooks/useAdminCategories';
import { IconPicker } from './IconPicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Toggle switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** null = Add mode, Service = Edit mode */
  service: Service | null;
  /** Receives the validated DTO — caller handles the actual API call */
  onCreate: (dto: AdminCreateServiceDto) => Promise<void>;
  onUpdate: (id: string, dto: AdminUpdateServiceDto) => Promise<void>;
};

export function ServiceFormDialog({ open, onOpenChange, service, onCreate, onUpdate }: Props) {
  const isEdit = service !== null;
  const tAdd = useTranslations('dashboard.serviceManagement.addService');
  const tEdit = useTranslations('dashboard.serviceManagement.editService');
  const t = isEdit ? tEdit : tAdd;

  const [form, setForm] = useState<ServiceForm>(DEFAULT_SERVICE_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form when open / service changes
  useEffect(() => {
    if (open) {
      if (service) {
        setForm({
          name: service.name,
          description: service.description ?? '',
          iconUrl: service.iconUrl ?? '',
          price: String(service.price),
          durationMinutes: String(service.durationMinutes),
          maxSlotsPerHour: String(service.maxSlotsPerHour),
          categoryId: service.category?.id ?? '',
          preparationNotes: service.preparationNotes ?? '',
          tags: (service.tags || []).join(', '),
          isActive: service.isActive,
        });
      } else {
        setForm(DEFAULT_SERVICE_FORM);
      }
      setErrors({});
    }
  }, [open, service]);

  const { categories, fetchCategories } = useAdminCategories();
  
  useEffect(() => {
    fetchCategories({ isActive: true });
  }, [fetchCategories]);

  const set = <K extends keyof ServiceForm>(k: K, v: ServiceForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof ServiceForm, string>> = {};
    if (!form.name.trim()) e.name = t('errors.nameRequired');
    else if (form.name.trim().length < 2) e.name = t('errors.nameTooShort');
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) e.price = t('errors.priceInvalid');
    const dur = parseInt(form.durationMinutes, 10);
    if (isNaN(dur) || dur < 1 || dur > 120) e.durationMinutes = t('errors.durationInvalid');
    const slots = parseInt(form.maxSlotsPerHour, 10);
    if (isNaN(slots) || slots < 1 || slots > 10) e.maxSlotsPerHour = t('errors.maxSlotsInvalid');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: AdminCreateServiceDto = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        iconUrl: form.iconUrl || undefined,
        price: parseFloat(form.price),
        durationMinutes: parseInt(form.durationMinutes, 10),
        maxSlotsPerHour: parseInt(form.maxSlotsPerHour, 10),
        categoryId: form.categoryId,
        preparationNotes: form.preparationNotes.trim() || undefined,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        isActive: form.isActive,
      };

      if (isEdit) {
        await onUpdate(service!.id, payload);
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch {
      // toast already shown by hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center shrink-0">
              {isEdit ? <PencilSimpleIcon size={20} weight="fill" /> : <PlusIcon size={20} weight="bold" />}
            </div>
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          {!isEdit && <p className="text-xs text-[#94a3b8] ml-12">{tAdd('subtitle')}</p>}
          {isEdit && <p className="text-xs text-[#94a3b8] ml-12">{service?.name}</p>}
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <Field label={t('name')} htmlFor="svc-name" required error={errors.name}>
            <Input
              id="svc-name"
              placeholder={t('namePlaceholder')}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.name && 'border-red-400')}
            />
          </Field>

          {/* Icon + Category */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('icon')} htmlFor="svc-icon">
              <IconPicker
                value={form.iconUrl}
                onChange={(v: string) => set('iconUrl', v)}
                placeholder={t('iconPlaceholder')}
              />
            </Field>
            <Field label={t('category')} htmlFor="svc-category">
              <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
                <SelectTrigger id="svc-category" className="h-10 rounded-xl border-[#e2e8f0]">
                  <SelectValue placeholder={t('categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Description */}
          <Field label={t('description')} htmlFor="svc-desc">
            <Textarea
              id="svc-desc"
              rows={2}
              placeholder={t('descriptionPlaceholder')}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Preparation Notes */}
          <Field label={t('preparationNotes')} htmlFor="svc-prep">
            <Textarea
              id="svc-prep"
              rows={3}
              placeholder={t('preparationNotesPlaceholder')}
              value={form.preparationNotes}
              onChange={(e) => set('preparationNotes', e.target.value)}
              className="resize-none rounded-xl border-[#e2e8f0] focus-visible:ring-[#1392ec]/20"
            />
          </Field>

          {/* Price + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('price')} htmlFor="svc-price" required error={errors.price}>
              <Input
                id="svc-price"
                type="number"
                min={0}
                placeholder={t('pricePlaceholder')}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.price && 'border-red-400')}
              />
            </Field>
            <Field label={t('duration')} htmlFor="svc-dur" required error={errors.durationMinutes}>
              <Input
                id="svc-dur"
                type="number"
                min={1}
                max={120}
                placeholder={t('durationPlaceholder')}
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.durationMinutes && 'border-red-400')}
              />
            </Field>
          </div>

          {/* Max slots + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('maxSlots')} htmlFor="svc-slots" required error={errors.maxSlotsPerHour}>
              <Input
                id="svc-slots"
                type="number"
                min={1}
                max={10}
                placeholder={t('maxSlotsPlaceholder')}
                value={form.maxSlotsPerHour}
                onChange={(e) => set('maxSlotsPerHour', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.maxSlotsPerHour && 'border-red-400')}
              />
            </Field>
            <Field label={t('tags')} htmlFor="svc-tags">
              <Input
                id="svc-tags"
                placeholder={t('tagsPlaceholder')}
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>
          </div>

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
            className="px-5 py-2 rounded-xl text-sm font-semibold text-[#64748b] border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer"
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
              <><UserIcon size={16} weight="fill" />{t('save')}</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
