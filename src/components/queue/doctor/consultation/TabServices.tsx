'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TrashIcon, PlusIcon } from '@phosphor-icons/react';

interface TabServicesProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
}

export function TabServices({ item, medicalRecord, onChange }: TabServicesProps) {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { services: procedures, isLoading } = useServices({ isActive: true, categoryType: 'EXAMINATION' });
  
  const orders = medicalRecord?.visitServiceOrders || [];
  const totalPrice = orders.reduce((sum, order) => sum + (order.service?.price || 0), 0);

  const handleAdd = async () => {
    if (!selectedServiceId) return;
    try {
      setIsSubmitting(true);
      await medicalRecordsApi.orderServices(item.bookingId, {
        serviceIds: [selectedServiceId]
      });
      toast.success('Đã thêm chỉ định');
      setSelectedServiceId('');
      onChange();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thêm chỉ định');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      await medicalRecordsApi.removeServiceOrder(item.bookingId, orderId);
      toast.success('Đã xóa chỉ định');
      onChange();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa chỉ định (chỉ được xóa khi Đang chờ)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">Dịch vụ chuyên khoa chỉ định</div>
        </div>
        
        <div className="text-[11px] bg-blue-50 text-blue-800 border border-blue-100 rounded-md p-2 mb-4">
          Các dịch vụ/thủ thuật này sẽ được bệnh nhân nộp phí tại quầy lễ tân (B3) trước khi thực hiện.
        </div>

        {/* List of ordered services */}
        <div className="flex flex-col gap-2 mb-4">
          {orders.length === 0 ? (
            <div className="text-center p-4 text-[12px] text-slate-400 italic">
              Chưa có chỉ định nào.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-[12px] font-medium text-slate-800">{order.service.name}</div>
                  <div className="text-[11px] text-slate-500">{order.service.category || 'Dịch vụ'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-blue-800">
                    {order.service.price?.toLocaleString('vi-VN')} đ
                  </span>
                  <button 
                    onClick={() => handleRemove(order.id)}
                    disabled={isSubmitting || order.status !== 'PENDING'}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add new service */}
        <div className="flex gap-2">
          <select 
            className="flex-1 border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400"
            value={selectedServiceId}
            onChange={e => setSelectedServiceId(e.target.value)}
            disabled={isLoading || isSubmitting}
          >
            <option value="">— Chọn dịch vụ chuyên khoa —</option>
            {procedures.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.price?.toLocaleString('vi-VN')} đ</option>
            ))}
          </select>
          <Button 
            onClick={handleAdd}
            disabled={!selectedServiceId || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white h-[38px] px-4 rounded-md text-[12px]"
          >
            <PlusIcon size={14} className="mr-1" />
            Thêm
          </Button>
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <span className="text-[12px] text-slate-500">Tổng phí dịch vụ:</span>
          <span className="text-[16px] font-semibold text-blue-800">{totalPrice.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    </div>
  );
}
