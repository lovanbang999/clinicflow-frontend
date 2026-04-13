'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { labOrdersApi } from '@/lib/api/clinical/lab-orders';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash, Plus } from '@phosphor-icons/react';

interface TabLabsProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
}

export function TabLabs({ item, medicalRecord, onChange }: TabLabsProps) {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { services: labServices, isLoading } = useServices({ isActive: true, categoryType: 'LAB' });
  
  const labs = medicalRecord?.labOrders || [];
  // Price from service mapped via testName is a bit tricky, but let's assume we can lookup
  // Wait, LabOrder doesn't store price. Let's find price by matching testName with service name.
  const getPrice = (serviceId: string) => {
    const s = labServices.find(s => s.id === serviceId);
    return s?.price || 0;
  };

  const totalPrice = labs.reduce((sum, lab) => sum + getPrice(lab.serviceId || ''), 0);

  const handleAdd = async () => {
    if (!selectedServiceId) return;
    const selectedSrv = labServices.find(s => s.id === selectedServiceId);
    if (!selectedSrv) return;

    try {
      setIsSubmitting(true);
      await labOrdersApi.createOrder({
        bookingId: item.bookingId,
        testName: selectedSrv.name,
        serviceId: selectedSrv.id,
      });
      toast.success('Đã thêm xét nghiệm');
      setSelectedServiceId('');
      onChange();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thêm xét nghiệm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      await labOrdersApi.deleteOrder(orderId);
      toast.success('Đã xóa xét nghiệm');
      onChange();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa xét nghiệm (chỉ được xóa khi chưa nộp phí)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">Xét nghiệm cận lâm sàng</div>
        </div>
        
        <div className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 rounded-md p-2 mb-4">
          Kết quả xét nghiệm sẽ tự động thông báo cho bác sĩ khi phòng Lab hoàn tất. Bệnh nhân cần nộp phí trước tại quầy lễ tân (B3).
        </div>

        {/* List of ordered labs */}
        <div className="flex flex-col gap-2 mb-4">
          {labs.length === 0 ? (
            <div className="text-center p-4 text-[12px] text-slate-400 italic">
              Chưa có xét nghiệm nào.
            </div>
          ) : (
            labs.map(lab => (
              <div key={lab.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-[12px] font-medium text-slate-800">{lab.testName}</div>
                  <div className="text-[11px] text-slate-500">Xét nghiệm</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-blue-800">
                    {getPrice(lab.serviceId || '').toLocaleString('vi-VN')} đ
                  </span>
                  <button 
                    onClick={() => handleRemove(lab.id)}
                    disabled={isSubmitting || lab.status !== 'PENDING'}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add new lab */}
        <div className="flex gap-2">
          <select 
            className="flex-1 border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400"
            value={selectedServiceId}
            onChange={e => setSelectedServiceId(e.target.value)}
            disabled={isLoading || isSubmitting}
          >
            <option value="">— Chọn xét nghiệm —</option>
            {labServices.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.price?.toLocaleString('vi-VN')} đ</option>
            ))}
          </select>
          <Button 
            onClick={handleAdd}
            disabled={!selectedServiceId || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white h-[38px] px-4 rounded-md text-[12px]"
          >
            <Plus size={14} className="mr-1" />
            Thêm
          </Button>
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <span className="text-[12px] text-slate-500">Tổng phí xét nghiệm:</span>
          <span className="text-[16px] font-semibold text-blue-800">{totalPrice.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    </div>
  );
}
