import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  XIcon,
  PlusIcon,
  PrinterIcon,
  CheckIcon,
  PencilIcon,
} from '@phosphor-icons/react/dist/ssr';
import { Input } from '@/components/ui/input';
import type { CreateMedicalRecordDto } from '@/lib/api/clinical/medical-records';
import { useTranslations } from 'next-intl';
import type { UseFormRegister, UseFormGetValues, FieldArrayWithId } from 'react-hook-form';

export function DoctorPrescriptionTab() {
  const t = useTranslations('emr.prescription');
  const { control, register, getValues } = useFormContext<CreateMedicalRecordDto>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prescriptionItems',
  });

  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  if (!hasInitialized && fields.length > 0) {
    setConfirmedIds(new Set(fields.map(f => f.id)));
    setHasInitialized(true);
  }

  const handlePrint = () => window.print();

  const markAsConfirmed = (id: string) => {
    setConfirmedIds(prev => new Set(prev).add(id));
  };

  const toggleEdit = (id: string) => {
    setConfirmedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAdd = () => {
    append({
      medicineName: '',
      dosage: '',
      frequency: '',
      quantity: 1,
      unit: 'viên'
    });
    setHasInitialized(true);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <PrescriptionHeader t={t} onPrint={handlePrint} onAdd={handleAdd} />
      
      <div className="px-6 pb-6 mt-4">
        <div className="flex flex-col gap-3">
          {fields.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            fields.map((field, index) => (
              confirmedIds.has(field.id) ? (
                <PrescriptionItem 
                  key={field.id}
                  index={index}
                  t={t}
                  getValues={getValues}
                  onEdit={() => toggleEdit(field.id)}
                  onRemove={() => remove(index)}
                />
              ) : (
                <PrescriptionForm 
                  key={field.id}
                  index={index}
                  t={t}
                  register={register}
                  onRemove={() => remove(index)}
                  onConfirm={() => markAsConfirmed(field.id)}
                />
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface PrescriptionHeaderProps {
  t: (key: string) => string;
  onPrint: () => void;
  onAdd: () => void;
}

function PrescriptionHeader({ t, onPrint, onAdd }: PrescriptionHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
          {t('title')}
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={onPrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <PrinterIcon size={20} weight="bold" />
            <span className="font-semibold">{t('printBtn')}</span>
          </button>
          <button type="button" onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
            <PlusIcon size={20} weight="bold" />
            <span className="font-semibold">{t('addMedicine')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="py-12 text-center text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-xl">
      {t('emptyList')}
    </div>
  );
}

interface PrescriptionItemProps {
  field: FieldArrayWithId<CreateMedicalRecordDto, 'prescriptionItems', 'id'>;
  index: number;
  t: (key: string) => string;
  getValues: UseFormGetValues<CreateMedicalRecordDto>;
  onEdit: () => void;
  onRemove: () => void;
}

function PrescriptionItem({ index, t, getValues, onEdit, onRemove }: Omit<PrescriptionItemProps, 'field'>) {
  const values = getValues(`prescriptionItems.${index}`);
  if (!values) return null;
  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl relative group hover:border-blue-100 hover:shadow-sm transition-all">
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onEdit} className="flex items-center gap-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md cursor-pointer transition-colors">
          <PencilIcon size={16} weight="bold" />
          <span className="text-xs font-bold">{t('editAction')}</span>
        </button>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full cursor-pointer transition-colors">
          <XIcon size={16} weight="bold" />
        </button>
      </div>
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-bold text-gray-900 leading-tight truncate">{values.medicineName}</h4>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200">
            {values.quantity} {values.unit}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{values.dosage}</span>
          <span className="font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{values.frequency}</span>
          {values.durationDays && (
            <span className="font-medium bg-orange-50/50 text-orange-700 px-2 py-0.5 rounded border border-orange-100/50">
              {values.durationDays} {t('durationPlaceholder')}
            </span>
          )}
        </div>
        {values.instructions && (
          <div className="mt-2.5 p-2.5 bg-blue-50/30 rounded-lg text-[11px] text-blue-800 italic border border-blue-100/20">
            {values.instructions}
          </div>
        )}
      </div>
    </div>
  );
}

interface PrescriptionFormProps {
  field: FieldArrayWithId<CreateMedicalRecordDto, 'prescriptionItems', 'id'>;
  index: number;
  t: (key: string) => string;
  register: UseFormRegister<CreateMedicalRecordDto>;
  onRemove: () => void;
  onConfirm: () => void;
}

function PrescriptionForm({ index, t, register, onRemove, onConfirm }: Omit<PrescriptionFormProps, 'field'>) {
  return (
    <div className="flex flex-col gap-4 p-5 bg-blue-50/10 border-2 border-blue-200 rounded-xl relative shadow-md shadow-blue-500/5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">{t('medicineName')}</label>
          <Input placeholder={t('medicinePlaceholder')} {...register(`prescriptionItems.${index}.medicineName`, { required: true })} className="h-10 text-sm bg-white" autoFocus />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">{t('dosage')}</label>
          <Input placeholder={t('dosagePlaceholder')} {...register(`prescriptionItems.${index}.dosage`, { required: true })} className="h-10 text-sm bg-white" />
        </div>
        <div className="md:col-span-3">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">{t('frequency')}</label>
          <Input placeholder={t('frequencyPlaceholder')} {...register(`prescriptionItems.${index}.frequency`, { required: true })} className="h-10 text-sm bg-white" />
        </div>
        <div className="md:col-span-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">{t('durationDays')}</label>
          <Input type="number" placeholder={t('durationPlaceholder')} {...register(`prescriptionItems.${index}.durationDays`, { valueAsNumber: true })} className="h-10 text-sm bg-white" />
        </div>
        <div className="md:col-span-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">{t('quantity')}</label>
          <Input type="number" placeholder={t('quantityPlaceholder')} {...register(`prescriptionItems.${index}.quantity`, { required: true, valueAsNumber: true })} className="h-10 text-sm bg-white" />
        </div>
        <div className="md:col-span-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">{t('unit')}</label>
          <Input placeholder={t('unitPlaceholder')} {...register(`prescriptionItems.${index}.unit`, { required: true })} className="h-10 text-sm bg-white" />
        </div>
        <div className="md:col-span-12">
          <Input placeholder={t('instructionsPlaceholder')} {...register(`prescriptionItems.${index}.instructions`)} className="h-10 text-sm bg-white" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-blue-50">
        <button type="button" onClick={onRemove} className="px-4 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
          {t('deleteAction')}
        </button>
        <button type="button" onClick={onConfirm} className="flex items-center gap-2 px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-bold">
          <CheckIcon size={18} weight="bold" />
          {t('confirmBtn')}
        </button>
      </div>
    </div>
  );
}
