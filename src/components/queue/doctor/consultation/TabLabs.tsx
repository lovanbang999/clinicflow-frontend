'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { labOrdersApi } from '@/lib/api/clinical/lab-orders';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TrashIcon, PlusIcon, FlaskIcon } from '@phosphor-icons/react';

import type { Service } from '@/types/service';

interface TabLabsProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  draftLabs: Service[];
  setDraftLabs: (val: Service[]) => void;
  onChange: () => void;
}

const STATUS_CONFIG = {
  PENDING:     { label: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAID:        { label: 'Chờ thực hiện',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  COMPLETED:   { label: 'Có kết quả',     className: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED:   { label: 'Đã hủy',         className: 'bg-gray-100 text-gray-500 border-gray-200' },
} as const;

export function TabLabs({ medicalRecord, draftLabs, setDraftLabs, onChange }: TabLabsProps) {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fix 1: Filter only Nhóm 1 — services performed by TECHNICIAN
  const { services: labServices, isLoading } = useServices({
    isActive: true,
    performedBy: 'TECHNICIAN',
  });

  const labs = medicalRecord?.labOrders || [];

  // Fix 2: Safely calculate price — prefer service lookup, fall back to 0 with clear display
  const getPriceByServiceId = (serviceId: string | undefined) => {
    if (!serviceId) return null;
    return labServices.find((s) => s.id === serviceId)?.price ?? null;
  };

  const dbTotalPrice = labs.reduce((sum, lab) => {
    const price = getPriceByServiceId(lab.serviceId);
    return sum + Number(price ?? 0);
  }, 0);
  
  const draftTotalPrice = draftLabs.reduce((sum, lab) => sum + Number(lab.price ?? 0), 0);
  const totalPrice = dbTotalPrice + draftTotalPrice;

  // Ids already ordered or drafted — prevent duplicate add
  const existingServiceIds = new Set([
    ...labs.map((l) => l.serviceId).filter(Boolean),
    ...draftLabs.map((l) => l.id)
  ]);
  const availableServices = labServices.filter((s) => !existingServiceIds.has(s.id));

  const handleAdd = () => {
    if (!selectedServiceId) return;
    const selectedSrv = labServices.find((s) => s.id === selectedServiceId);
    if (!selectedSrv) return;

    setDraftLabs([...draftLabs, selectedSrv]);
    setSelectedServiceId('');
  };

  const handleRemove = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      await labOrdersApi.deleteOrder(orderId);
      toast.success('Đã xóa xét nghiệm');
      onChange();
    } catch (error) {
      console.error(error);
      toast.error('Chỉ được xóa khi xét nghiệm chưa được thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskIcon size={14} className="text-amber-600" />
          <div className="text-[13px] font-medium text-slate-800">Chỉ định xét nghiệm & kỹ thuật</div>
          <span className="text-[10px] text-slate-400 ml-auto">Nhóm 1 — Kỹ thuật viên thực hiện</span>
        </div>

        <div className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 rounded-md p-2 mb-4">
          Kỹ thuật viên sẽ nhận lệnh tự động sau khi bệnh nhân thanh toán tại quầy lễ tân. Kết quả sẽ tự động thông báo cho bác sĩ khi Lab hoàn tất.
        </div>

        {/* List of ordered labs */}
        <div className="flex flex-col gap-2 mb-4">
          {labs.length === 0 && draftLabs.length === 0 ? (
            <div className="text-center p-4 text-[12px] text-slate-400 italic">
              Chưa có xét nghiệm nào.
            </div>
          ) : (
            <>
              {/* Saved Labs */}
              {labs.map((lab) => {
                const statusCfg = STATUS_CONFIG[lab.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                const price = getPriceByServiceId(lab.serviceId);
                const isCompleted = lab.status === 'COMPLETED';
                const isAbnormal = lab.result?.isAbnormal;

                return (
                  <div
                    key={lab.id}
                    className={`flex justify-between items-start p-2.5 rounded-lg border ${
                      isAbnormal
                        ? 'bg-red-50 border-red-200'
                        : isCompleted
                        ? 'bg-green-50 border-green-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-slate-800 truncate">{lab.testName}</div>
                      {isCompleted && lab.result?.resultText && (
                        <div className={`text-[11px] mt-0.5 truncate ${isAbnormal ? 'text-red-600 font-medium' : 'text-green-700'}`}>
                          {isAbnormal ? '⚠ ' : ''}KQ: {lab.result.resultText}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                      {/* Show price or dash if not available */}
                      <span className="text-[12px] font-semibold text-slate-700 min-w-[60px] text-right">
                        {price !== null ? `${price.toLocaleString('vi-VN')} đ` : '—'}
                      </span>
                      <button
                        onClick={() => handleRemove(lab.id)}
                        disabled={isSubmitting || lab.status !== 'PENDING'}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={lab.status !== 'PENDING' ? 'Không thể xóa — đã thanh toán hoặc đang thực hiện' : 'Xóa xét nghiệm'}
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Draft Labs */}
              {draftLabs.map((draft) => (
                <div
                  key={draft.id}
                  className="flex justify-between items-start p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-amber-800 truncate">{draft.name}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-white text-amber-600 border-amber-200 italic">
                      Chưa lưu
                    </span>
                    <span className="text-[12px] font-semibold text-slate-700 min-w-[60px] text-right">
                      {draft.price !== null ? `${draft.price.toLocaleString('vi-VN')} đ` : '—'}
                    </span>
                    <button
                      onClick={() => setDraftLabs(draftLabs.filter(l => l.id !== draft.id))}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Bỏ nháp"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Add new lab */}
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 bg-white"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            disabled={isLoading || isSubmitting}
          >
            <option value="">— Chọn xét nghiệm / kỹ thuật —</option>
            {availableServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {(s.price ?? 0).toLocaleString('vi-VN')} đ
              </option>
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
        {(labs.length > 0 || draftLabs.length > 0) && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-[11px] text-slate-400">{labs.length + draftLabs.length} xét nghiệm</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-500">Tổng phí:</span>
              <span className="text-[15px] font-semibold text-blue-800">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
