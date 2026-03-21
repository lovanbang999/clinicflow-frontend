'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { XIcon, PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateMedicalRecordDto } from '@/lib/api/medical-records';
import { useTranslations } from 'next-intl';

interface DoctorPrescriptionTabProps {
  bookingId: string;
}

export function DoctorPrescriptionTab({}: DoctorPrescriptionTabProps) {
  const t = useTranslations('dashboard.doctor.workspace.prescriptionTab');
  const { control, register } = useFormContext<CreateMedicalRecordDto>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prescriptionItems',
  });

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-[16px] font-bold text-gray-900">
          {t('title')}
        </h3>
        <Button 
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({
            medicineName: '',
            dosage: '',
            frequency: '',
            quantity: 1,
            unit: 'Viên',
            durationDays: 1,
            instructions: '',
          })}
          className="h-8 text-[13px] font-medium text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
        >
          <PlusIcon size={14} className="mr-1" /> {t('addMedicine')}
        </Button>
      </div>
      
      <div className="px-6 pb-6 mt-4">
        <div className="flex flex-col gap-6">
          {fields.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
              {t('emptyList')}
            </div>
          ) : (
            fields.map((field, index) => (
              <div 
                key={field.id} 
                className="flex flex-col gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-xl relative group"
              >
                <button 
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
                  title={t('deleteAction')}
                >
                  <XIcon size={16} weight="bold" />
                </button>

                <div className="pr-8 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('medicineName')}</label>
                    <Input 
                      placeholder={t('medicinePlaceholder')} 
                      {...register(`prescriptionItems.${index}.medicineName` as const, { required: true })} 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('dosage')}</label>
                    <Input 
                      placeholder={t('dosagePlaceholder')} 
                      {...register(`prescriptionItems.${index}.dosage` as const, { required: true })} 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('frequency')}</label>
                    <Input 
                      placeholder={t('frequencyPlaceholder')} 
                      {...register(`prescriptionItems.${index}.frequency` as const, { required: true })} 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('durationDays')}</label>
                    <Input 
                      type="number"
                      placeholder={t('durationPlaceholder')} 
                      {...register(`prescriptionItems.${index}.durationDays` as const, { valueAsNumber: true })} 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('quantity')}</label>
                    <Input 
                      type="number"
                      placeholder={t('quantityPlaceholder')} 
                      {...register(`prescriptionItems.${index}.quantity` as const, { required: true, valueAsNumber: true })} 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('unit')}</label>
                    <Input 
                      placeholder={t('unitPlaceholder')} 
                      {...register(`prescriptionItems.${index}.unit` as const, { required: true })} 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="md:col-span-12">
                    <Input 
                      placeholder={t('instructionsPlaceholder')} 
                      {...register(`prescriptionItems.${index}.instructions` as const)} 
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
