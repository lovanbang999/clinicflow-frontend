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
  isReadOnly?: boolean;
}

export function TabPrescription({ item, medicalRecord, onChange, isReadOnly }: TabPrescriptionProps) {
  const t = useTranslations('emr.visit');
  const tp = useTranslations('emr.visit.prescriptionTab');
  
  const [items, setItems] = useState<PrescriptionItemInput[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'NONE' | 'GENERAL' | 'DETAILED'>('GENERAL');

  useEffect(() => {
    if (medicalRecord?.prescription) {
      const existingItems = medicalRecord.prescription?.items.map(i => ({
        medicineName: i.medicineName,
        dosage: i.dosage,
        frequency: i.frequency,
        quantity: i.quantity,
        unit: i.unit,
        instructions: i.instructions || '',
        visitServiceOrderId: i.visitServiceOrderId,
        labOrderId: i.labOrderId,
      })) || [];
      setItems(existingItems);
      setNotes(medicalRecord.prescription?.notes || '');

      if (existingItems.length === 0) {
        if (medicalRecord.prescription?.notes) {
          setMode('NONE'); 
        } else {
          setMode('GENERAL'); 
        }
      } else if (existingItems.some(i => i.visitServiceOrderId || i.labOrderId)) {
        setMode('DETAILED');
      } else {
        setMode('GENERAL');
      }
    }
  }, [medicalRecord]);

  const hasDetailedOptions = 
    (medicalRecord?.visitServiceOrders?.filter(v => v.status !== 'CANCELLED').length || 0) > 0 || 
    (medicalRecord?.labOrders?.filter(l => l.status !== 'CANCELLED').length || 0) > 0;

  const handleAddItem = (visitServiceOrderId?: string, labOrderId?: string) => {
    if (isReadOnly) return;
    setItems([
      ...items,
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        quantity: 1,
        unit: tp('unitPill'),
        instructions: '',
        visitServiceOrderId,
        labOrderId
      }
    ]);
  };

  const handleChangeItem = <K extends keyof PrescriptionItemInput>(index: number, field: K, value: PrescriptionItemInput[K]) => {
    if (isReadOnly) return;
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (isReadOnly) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    try {
      let itemsToSave = items;
      if (mode === 'NONE') {
        itemsToSave = [];
      }

      if (itemsToSave.some(i => !i.medicineName || !i.dosage || !i.frequency || !i.quantity)) {
        toast.error(tp('errors.incomplete'));
        return;
      }
      setIsSubmitting(true);
      await medicalRecordsApi.savePrescription(item.bookingId, {
        notes,
        items: itemsToSave
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

  const renderItemLine = (med: PrescriptionItemInput, index: number) => (
    <div key={index} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-2 relative shadow-sm mb-3 last:mb-0">
      {!isReadOnly && (
        <button 
          onClick={() => handleRemoveItem(index)}
          className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-1 rounded transition-colors"
          aria-label={tp('removeAct')}
        >
          <TrashIcon size={16} />
        </button>
      )}
      <div className={`grid grid-cols-12 gap-3 ${isReadOnly ? '' : 'pr-8'}`}>
        <div className="col-span-12 md:col-span-5">
          <input 
            placeholder={tp('medNamePlaceholder')}
            className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:opacity-70 disabled:bg-slate-50"
            value={med.medicineName}
            onChange={e => handleChangeItem(index, 'medicineName', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <input 
            placeholder={tp('dosagePlaceholder')}
            className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:opacity-70 disabled:bg-slate-50"
            value={med.dosage}
            onChange={e => handleChangeItem(index, 'dosage', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        <div className="col-span-6 md:col-span-4">
          <input 
            placeholder={tp('freqPlaceholder')}
            className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:opacity-70 disabled:bg-slate-50"
            value={med.frequency}
            onChange={e => handleChangeItem(index, 'frequency', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <div className="flex items-center">
            <span className="text-[11px] text-slate-500 mr-2 whitespace-nowrap">{tp('qtyLabel')}</span>
            <input 
              type="number"
              min="1"
              className="w-16 text-[13px] px-2 py-1.5 border border-gray-200 rounded-l focus:border-blue-400 focus:outline-none disabled:opacity-70 disabled:bg-slate-50"
              value={med.quantity}
              onChange={e => handleChangeItem(index, 'quantity', parseInt(e.target.value) || 1)}
              disabled={isReadOnly}
            />
            <input 
              placeholder={tp('unitPlaceholder')}
              className="w-16 text-[13px] px-2 py-1.5 border border-gray-200 border-l-0 rounded-r focus:border-blue-400 focus:outline-none bg-white disabled:opacity-70 disabled:bg-slate-50"
              value={med.unit}
              onChange={e => handleChangeItem(index, 'unit', e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-9">
          <input 
            placeholder={tp('usagePlaceholder')}
            className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:opacity-70 disabled:bg-slate-50"
            value={med.instructions}
            onChange={e => handleChangeItem(index, 'instructions', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => !isReadOnly && setMode('NONE')}
                className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${mode === 'NONE' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'} ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={isReadOnly}
              >
                Không kê đơn
              </button>
              <button
                onClick={() => !isReadOnly && setMode('GENERAL')}
                className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${mode === 'GENERAL' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'} ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={isReadOnly}
              >
                Kê đơn chung
              </button>
              {hasDetailedOptions && (
                <button
                  onClick={() => !isReadOnly && setMode('DETAILED')}
                  className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${mode === 'DETAILED' ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500 hover:text-slate-700'} ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                  disabled={isReadOnly}
                >
                  Kê đơn chuyên biệt
                </button>
              )}
            </div>
            {isReadOnly && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2">READ ONLY</span>}
          </div>
          
          {!isReadOnly && (
            <Button 
              onClick={() => setItems([])}
              variant="ghost"
              size="sm"
              className="h-8 text-[12px] text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={mode === 'NONE'}
            >
              <TrashIcon size={14} className="mr-1" /> Làm lại đơn thuốc
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {mode === 'NONE' && (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="text-[13px] text-slate-500 mb-1">Bạn đã chọn không kê đơn thuốc cho bệnh nhân này.</div>
              <div className="text-[12px] text-slate-400">Bạn vẫn có thể điền Lời dặn bác sĩ ở bên dưới.</div>
            </div>
          )}

          {mode !== 'NONE' && mode === 'GENERAL' && (
            <div className="border border-blue-100 bg-blue-50/30 rounded-xl overflow-hidden">
              <div className="bg-blue-50/60 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
                <div className="text-[12px] font-semibold text-blue-800">💊 Đơn thuốc chung</div>
                {!isReadOnly && (
                  <Button 
                    onClick={() => handleAddItem()} 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[11px] text-blue-600 border-blue-200 hover:bg-white bg-white shadow-sm"
                  >
                    <PlusIcon size={12} className="mr-1" /> {tp('addBtn')}
                  </Button>
                )}
              </div>
              <div className="p-4 bg-slate-50/50">
                {items.map((i, idx) => (!i.visitServiceOrderId && !i.labOrderId) && renderItemLine(i, idx))}
                {items.findIndex(i => !i.visitServiceOrderId && !i.labOrderId) === -1 && (
                  <div className={`text-[12px] text-slate-400 italic text-center py-6 border border-dashed border-gray-200 rounded-lg ${isReadOnly ? '' : 'cursor-pointer hover:bg-slate-50'} transition-colors`} onClick={() => !isReadOnly && handleAddItem()}>
                    Chưa có thuốc chung. {isReadOnly ? '' : 'Bấm vào đây để thêm.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VSO Groups */}
          {mode === 'DETAILED' && medicalRecord?.visitServiceOrders?.filter(v => v.status !== 'CANCELLED').map(vso => (
            <div key={vso.id} className="border border-violet-100 bg-violet-50/10 rounded-xl overflow-hidden">
              <div className="bg-violet-50/50 px-4 py-2 border-b border-violet-100 flex justify-between items-center">
                <div className="text-[12px] font-semibold text-violet-800">🩺 Dành cho: {vso.service?.name || 'Dịch vụ'}</div>
                {!isReadOnly && (
                  <Button 
                    onClick={() => handleAddItem(vso.id, undefined)} 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[11px] text-violet-600 border-violet-200 hover:bg-white bg-white shadow-sm"
                  >
                    <PlusIcon size={12} className="mr-1" /> Kê thuốc này
                  </Button>
                )}
              </div>
              <div className="p-4 bg-slate-50/50">
                {items.map((i, idx) => i.visitServiceOrderId === vso.id && renderItemLine(i, idx))}
                {items.findIndex(i => i.visitServiceOrderId === vso.id) === -1 && (
                  <div className={`text-[12px] text-slate-400 italic text-center py-3 border border-dashed border-violet-100 rounded-lg ${isReadOnly ? '' : 'cursor-pointer hover:bg-violet-50'} transition-colors`} onClick={() => !isReadOnly && handleAddItem(vso.id, undefined)}>
                    (Không kê thuốc riêng cho dịch vụ này)
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Lab Groups */}
          {mode === 'DETAILED' && medicalRecord?.labOrders?.filter(l => l.status !== 'CANCELLED').map(lab => (
            <div key={lab.id} className="border border-teal-100 bg-teal-50/10 rounded-xl overflow-hidden">
              <div className="bg-teal-50/50 px-4 py-2 border-b border-teal-100 flex justify-between items-center">
                <div className="text-[12px] font-semibold text-teal-800">🔬 Dành cho: {lab.testName || 'Xét nghiệm'}</div>
                {!isReadOnly && (
                  <Button 
                    onClick={() => handleAddItem(undefined, lab.id)} 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[11px] text-teal-600 border-teal-200 hover:bg-white bg-white shadow-sm"
                  >
                    <PlusIcon size={12} className="mr-1" /> Kê thuốc này
                  </Button>
                )}
              </div>
              <div className="p-4 bg-slate-50/50">
                {items.map((i, idx) => i.labOrderId === lab.id && renderItemLine(i, idx))}
                {items.findIndex(i => i.labOrderId === lab.id) === -1 && (
                  <div className={`text-[12px] text-slate-400 italic text-center py-3 border border-dashed border-teal-100 rounded-lg ${isReadOnly ? '' : 'cursor-pointer hover:bg-teal-50'} transition-colors`} onClick={() => !isReadOnly && handleAddItem(undefined, lab.id)}>
                    (Không kê thuốc riêng cho xét nghiệm này)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase">{tp('doctorAdvice')}</label>
          <textarea 
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={tp('advicePlaceholder')}
            rows={2}
            className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors resize-none disabled:opacity-70 disabled:bg-slate-50"
            disabled={isReadOnly}
          />
        </div>

        {!isReadOnly && (
          <div className="flex justify-end gap-3 hover:translate-y-[1px]">
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-[13px] h-9 px-5"
            >
              {isSubmitting ? t('symptoms.saving') : t('symptoms.save')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
