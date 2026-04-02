'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { medicalRecordsApi, type CreatePrescriptionDto, type PrescriptionItemInput, type VisitResultsResponse } from '@/lib/api/medical-records';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';

interface PrescriptionTabProps {
  bookingId: string;
  record: VisitResultsResponse | null;
  onSaved: (updated: VisitResultsResponse) => void;
}

export function PrescriptionTab({ bookingId, record, onSaved }: PrescriptionTabProps) {
  const t = useTranslations('emr.visit.prescription');
  const [isSaving, setIsSaving] = useState(false);
  const canPrescribe = record?.visitStep === 'DIAGNOSED' || record?.visitStep === 'PRESCRIBED' || record?.visitStep === 'COMPLETED';

  const { register, control, handleSubmit } = useForm<CreatePrescriptionDto>({
    defaultValues: {
      notes: record?.prescription?.notes ?? '',
      items: record?.prescription?.items?.length
        ? record.prescription.items.map((i) => ({
            medicineName: i.medicineName,
            dosage: i.dosage,
            frequency: i.frequency,
            durationDays: i.durationDays,
            quantity: i.quantity,
            unit: i.unit ?? t('unitPlaceholder'),
            instructions: i.instructions ?? '',
          }))
        : [{ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: t('unitPlaceholder'), instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = handleSubmit(async (data) => {
    if (!canPrescribe) {
      toast.warning(t('pendingWarning'));
      return;
    }
    try {
      setIsSaving(true);
      const updated = await medicalRecordsApi.savePrescription(bookingId, data);
      onSaved(updated);
      toast.success(t('success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="text-[15px] font-bold text-gray-800">{t('header')}</h3>

        {!canPrescribe && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
            {t.rich('pendingAlert', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </div>
        )}

        {/* Medicine items */}
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="col-span-12 sm:col-span-4 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('medicineName')}</Label>
                <Input
                  {...register(`items.${idx}.medicineName`)}
                  placeholder={t('medicineNamePlaceholder')}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              <div className="col-span-6 sm:col-span-2 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('dosage')}</Label>
                <Input
                  {...register(`items.${idx}.dosage`)}
                  placeholder={t('dosagePlaceholder')}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              <div className="col-span-6 sm:col-span-2 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('frequency')}</Label>
                <Input
                  {...register(`items.${idx}.frequency`)}
                  placeholder={t('frequencyPlaceholder')}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              <div className="col-span-4 sm:col-span-1 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('quantity')}</Label>
                <Input
                  type="number"
                  {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                  min={1}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              <div className="col-span-4 sm:col-span-1 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('unit')}</Label>
                <Input
                  {...register(`items.${idx}.unit`)}
                  placeholder={t('unitPlaceholder')}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              <div className="col-span-4 sm:col-span-1 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('duration')}</Label>
                <Input
                  type="number"
                  {...register(`items.${idx}.durationDays`, { valueAsNumber: true })}
                  placeholder={t('durationPlaceholder')}
                  min={1}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              <div className="col-span-11 space-y-1">
                <Label className="text-[11px] font-semibold text-gray-500">{t('instructions')}</Label>
                <Input
                  {...register(`items.${idx}.instructions`)}
                  placeholder={t('instructionsPlaceholder')}
                  disabled={!canPrescribe}
                  className="text-[13px] h-8"
                />
              </div>
              {fields.length > 1 && (
                <div className="col-span-1 flex items-end pb-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(idx)}
                    disabled={!canPrescribe}
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon size={15} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {canPrescribe && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ medicineName: '', dosage: '', frequency: '', quantity: 1, unit: t('unitPlaceholder'), instructions: '' } as PrescriptionItemInput)}
            className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <PlusIcon size={14} weight="bold" />
            {t('addMedicine')}
          </Button>
        )}

        <div className="space-y-1.5">
          <Label className="text-[13px] font-semibold">{t('notes')}</Label>
          <Textarea
            {...register('notes')}
            rows={2}
            placeholder={t('notesPlaceholder')}
            disabled={!canPrescribe}
            className="resize-none text-[14px]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving || !canPrescribe}
          className="px-8 bg-green-600 hover:bg-green-700 text-white disabled:opacity-40"
        >
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
}
