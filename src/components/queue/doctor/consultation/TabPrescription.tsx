'use client';

import { useState, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse, type PrescriptionItemInput } from '@/lib/api/clinical/medical-records';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TrashIcon, PlusIcon } from '@phosphor-icons/react';

interface TabPrescriptionProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
}

export function TabPrescription({ item, medicalRecord, onChange }: TabPrescriptionProps) {
  const t = useTranslations('emr.visit');
  const tp = useTranslations('emr.visit.prescriptionTab');
  
  const [items, setItems] = useState<PrescriptionItemInput[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicalRecord?.prescription) {
      setNotes(medicalRecord.prescription.notes || '');
      setItems(medicalRecord.prescription.items.map(i => ({
        medicineName: i.medicineName,
        dosage: i.dosage,
        frequency: i.frequency,
        quantity: i.quantity,
        unit: i.unit,
        instructions: i.instructions || ''
      })));
    }
  }, [medicalRecord]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        quantity: 1,
        unit: tp('unitPill'),
        instructions: ''
      }
    ]);
  };

  const handleChangeItem = <K extends keyof PrescriptionItemInput>(index: number, field: K, value: PrescriptionItemInput[K]) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      if (items.some(i => !i.medicineName || !i.dosage || !i.frequency || !i.quantity)) {
        toast.error(tp('errors.incomplete'));
        return;
      }
      setIsSubmitting(true);
      await medicalRecordsApi.savePrescription(item.bookingId, {
        notes,
        items
      });
      toast.success(t('messages.saveSuccess'));
      onChange();
    } catch (error) {
      console.error(error);
      toast.error(t('messages.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <div className="text-[13px] font-medium text-slate-800">{t('tabs.prescription')}</div>
          </div>
          <Button 
            onClick={handleAddItem}
            variant="outline"
            size="sm"
            className="h-8 text-[12px] text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <PlusIcon size={14} className="mr-1" /> {tp('addBtn')}
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center p-6 text-[12px] text-slate-400 italic border border-dashed border-gray-200 rounded-lg mb-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleAddItem}>
            {tp('emptyList')}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-4">
            {items.map((med, index) => (
              <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2 relative">
                <button 
                  onClick={() => handleRemoveItem(index)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                  aria-label={tp('removeAct')}
                >
                  <TrashIcon size={16} />
                </button>
                <div className="grid grid-cols-12 gap-3 pr-6">
                  <div className="col-span-12 md:col-span-5">
                    <input 
                      placeholder={tp('medNamePlaceholder')}
                      className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                      value={med.medicineName}
                      onChange={e => handleChangeItem(index, 'medicineName', e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <input 
                      placeholder={tp('dosagePlaceholder')}
                      className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                      value={med.dosage}
                      onChange={e => handleChangeItem(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-4">
                    <input 
                      placeholder={tp('freqPlaceholder')}
                      className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                      value={med.frequency}
                      onChange={e => handleChangeItem(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <div className="flex items-center">
                      <span className="text-[11px] text-slate-500 mr-2 whitespace-nowrap">{tp('qtyLabel')}</span>
                      <input 
                        type="number"
                        min="1"
                        className="w-16 text-[13px] px-2 py-1.5 border border-gray-200 rounded-l focus:border-blue-400 focus:outline-none"
                        value={med.quantity}
                        onChange={e => handleChangeItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <input 
                        placeholder={tp('unitPlaceholder')}
                        className="w-16 text-[13px] px-2 py-1.5 border border-gray-200 border-l-0 rounded-r focus:border-blue-400 focus:outline-none bg-white"
                        value={med.unit}
                        onChange={e => handleChangeItem(index, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <input 
                      placeholder={tp('usagePlaceholder')}
                      className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                      value={med.instructions}
                      onChange={e => handleChangeItem(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">{tp('doctorAdvice')}</label>
          <textarea 
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={tp('advicePlaceholder')}
            rows={2}
            className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting || items.length === 0}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-[13px] h-9 px-5"
          >
            {isSubmitting ? t('symptoms.saving') : t('symptoms.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
