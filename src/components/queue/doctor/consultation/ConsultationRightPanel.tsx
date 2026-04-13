'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import type { Service } from '@/types/service';
import {
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  FlaskIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';

interface ConsultationRightPanelProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  draftServices: Service[];
  draftLabs: Service[];
  isSaving: boolean;
  onFinalize: () => void;
}

export function ConsultationRightPanel({ item, medicalRecord, draftServices, draftLabs, isSaving, onFinalize }: ConsultationRightPanelProps) {
  const t = useTranslations('emr.visit');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const orders = medicalRecord?.visitServiceOrders || [];
  const labs = medicalRecord?.labOrders || [];

  const ordCount = orders.length + draftServices.length;
  const labCount = labs.length + draftLabs.length;
  const totalOrders = ordCount + labCount;

  // Safe price calculation including drafts
  const dbOrdTotal = orders.reduce((s, o) => s + Number(o.service?.price ?? 0), 0);
  const draftOrdTotal = draftServices.reduce((s, o) => s + Number(o.price ?? 0), 0);
  const ordTotal = dbOrdTotal + draftOrdTotal;

  const dbLabTotal = labs.reduce((s, l) => s + Number(l.service?.price ?? 0), 0);
  const draftLabTotal = draftLabs.reduce((s, l) => s + Number(l.price ?? 0), 0);
  const labTotal = dbLabTotal + draftLabTotal;
  const expectedTotal = draftOrdTotal + draftLabTotal;

  const hasOrders = totalOrders > 0;
  const hasDrafts = draftServices.length > 0 || draftLabs.length > 0;

  // Phase detection
  const isPhase2 = medicalRecord != null &&
    ['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep);

  // Fix 3: B7 action should only be enabled when the visit is actually finalized (prescription saved)
  const isFinalized = medicalRecord?.visitStep === 'PRESCRIBED' || medicalRecord?.visitStep === 'COMPLETED';

  // Counts for phase 2 status
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const completedLabs = labs.filter((l) => l.status === 'COMPLETED').length;
  const allResultsIn = completedOrders === ordCount && completedLabs === labCount && totalOrders > 0;

  return (
    <div className="bg-white border-l border-gray-200 overflow-y-auto p-4 flex flex-col gap-5" style={{ scrollbarWidth: 'thin' }}>

      {/* Status Flow */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
          {t('rightPanel.statusTitle')}
        </div>
        <div className="flex flex-col relative">

          {/* B1 — Done */}
          <div className="flex gap-2.5 pb-2 relative z-10">
            <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 border border-[#C0DD97] flex items-center justify-center shrink-0 mt-0.5">
              <CheckIcon size={12} weight="bold" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-slate-800">{t('rightPanel.workflow.reception')}</div>
              <div className="text-[11px] text-slate-500">{t('rightPanel.workflow.receptionDesc')}</div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[22px] w-[1px] h-4 bg-gray-200" />

          {/* B2 consultation — Active */}
          <div className="flex gap-2.5 pb-2 pt-2 relative z-10">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPhase2 ? 'bg-green-50 text-green-600 border border-[#C0DD97]' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
              {isPhase2
                ? <CheckIcon size={12} weight="bold" />
                : <div className="w-2 h-2 rounded-full bg-blue-600" />}
            </div>
            <div>
              <div className={`text-[12px] font-medium ${isPhase2 ? 'text-slate-800' : 'text-blue-700'}`}>
                {t('rightPanel.workflow.consulting')}
              </div>
              <div className="text-[11px] text-blue-500">
                {t('rightPanel.dr') || 'BS.'} {item.booking.doctor?.fullName}
              </div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[60px] w-[1px] h-4 bg-gray-200" />

          {/* B3 — lab payment */}
          <div className="flex gap-2.5 pb-2 pt-2 relative z-10">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPhase2 ? 'bg-green-50 text-green-600 border border-[#C0DD97]' : 'bg-white text-slate-300 border border-slate-200'}`}>
              {isPhase2
                ? <CheckIcon size={12} weight="bold" />
                : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
            </div>
            <div>
              <div className={`text-[12px] ${isPhase2 ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                {t('rightPanel.workflow.labPayment')}
              </div>
            </div>
          </div>
          <div className="absolute left-[9.5px] top-[98px] w-[1px] h-4 bg-gray-200" />

          {/* B7 — conclusion */}
          <div className="flex gap-2.5 pt-2 relative z-10">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isFinalized ? 'bg-green-50 text-green-600 border border-[#C0DD97]' : 'bg-white text-slate-300 border border-slate-200'}`}>
              {isFinalized
                ? <CheckIcon size={12} weight="bold" />
                : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
            </div>
            <div>
              <div className={`text-[12px] ${isFinalized ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                {t('rightPanel.workflow.conclusion')}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="h-[1px] bg-gray-100" />

      {/* Orders Summary */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">
          {t('rightPanel.summaryTitle')}
        </div>
        <div className="flex flex-col gap-1.5 mb-2">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-slate-500 flex items-center gap-1">
              <StethoscopeIcon size={11} className="text-blue-500" />
              {t('rightPanel.services')} ({ordCount})
            </span>
            <span className="font-medium text-slate-800">
              {ordTotal > 0 ? `${ordTotal.toLocaleString('vi-VN')} đ` : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-slate-500 flex items-center gap-1">
              <FlaskIcon size={11} className="text-amber-500" />
              {t('rightPanel.labs')} ({labCount})
            </span>
            <span className="font-medium text-slate-800">
              {labTotal > 0 ? `${labTotal.toLocaleString('vi-VN')} đ` : '—'}
            </span>
          </div>
        </div>

        {/* Phase 2: Results progress */}
        {isPhase2 && totalOrders > 0 && (
          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 rounded-md p-2 border border-slate-100">
            <div className="flex justify-between">
              <span>Kết quả đã có:</span>
              <span className={`font-medium ${allResultsIn ? 'text-green-600' : 'text-amber-600'}`}>
                {completedOrders + completedLabs}/{totalOrders}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="h-[1px] bg-gray-100" />

      {/* Context-aware Notice Box */}
      {isFinalized ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-[12px] text-green-700">
          <div className="font-bold mb-1 flex items-center gap-1">
            <CheckCircleIcon size={13} />
            Khám hoàn tất
          </div>
          Bệnh nhân đã được kê đơn và buổi khám đã được đóng.
        </div>
      ) : isPhase2 ? (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[12px] text-teal-700">
          <div className="font-bold mb-1">{t('rightPanel.readyB7')}</div>
          {t('rightPanel.readyB7Desc')}
        </div>
      ) : hasOrders ? (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[12px] text-teal-700">
          <div className="font-bold mb-1">{t('rightPanel.readyB3')}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <ClockIcon size={11} />
            <span>{t('rightPanel.readyB3Desc', { count: totalOrders })}</span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[12px] text-amber-700">
          <div className="font-bold mb-1">{t('rightPanel.noticeTitle')}</div>
          {t('rightPanel.noticeDesc')}
        </div>
      )}

      {/* Fix 3: Context-aware Action Button */}
      <div className="flex flex-col gap-2 mt-auto pb-2">
        {isFinalized ? (
          // B7 done — redirect to dashboard
          <Button
            onClick={onFinalize}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-[44px]"
          >
            <CheckCircleIcon size={18} className="mr-2" />
            Hoàn tất — Về trang chính
          </Button>
        ) : isPhase2 ? (
          // B7 in progress — informational, user uses TabPrescription to save
          <div className="text-center text-[11px] text-slate-400 italic px-2">
            Dùng tab <span className="font-medium text-slate-600">Kê đơn</span> để lưu đơn thuốc và kết thúc buổi khám.
          </div>
        ) : hasOrders ? (
          // B2 done with orders — guide patient to reception
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-700 text-center">
              <ArrowRightIcon size={11} className="inline mr-1" />
              Hướng dẫn bệnh nhân ra quầy lễ tân nộp phí xét nghiệm
            </div>
            <Button
              variant={hasDrafts ? "default" : "outline"}
              onClick={() => hasDrafts ? setIsConfirmOpen(true) : onFinalize()}
              disabled={isSaving}
              className={`w-full h-[38px] text-[12px] ${
                hasDrafts 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  : 'text-slate-600 border-slate-200'
              }`}
            >
              {isSaving ? 'Đang lưu...' : hasDrafts ? 'Lưu chỉ định & Kết thúc' : 'Quay về danh sách'}
            </Button>
          </div>
        ) : (
          // B2 no orders yet
          <div className="space-y-2">
            {hasDrafts && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-700 text-center">
                <ArrowRightIcon size={11} className="inline mr-1" />
                Lưu lại danh sách chỉ định đã chọn
              </div>
            )}
            <Button
              variant={hasDrafts ? "default" : "outline"}
              onClick={() => hasDrafts ? setIsConfirmOpen(true) : onFinalize()}
              disabled={isSaving}
              className={`w-full h-[38px] text-[12px] ${
                hasDrafts 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  : 'text-slate-600 border-slate-200'
              }`}
            >
              {isSaving ? 'Đang lưu...' : hasDrafts ? 'Lưu chỉ định & Kết thúc' : 'Quay về danh sách'}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận lưu chỉ định</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại danh sách các chỉ định trước khi lưu kết thúc lượt khám.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {draftServices.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[13px] font-semibold text-slate-800 mb-1.5 flex justify-between">
                  <span>Chuyên khoa ({draftServices.length})</span>
                </h4>
                <ul className="text-[12px] space-y-1.5 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  {draftServices.map((s, i) => (
                    <li key={`${s.id}-${i}`} className="flex justify-between gap-4">
                      <span className="truncate flex-1 text-slate-700">· {s.name}</span>
                      <span className="font-medium">{(s.price ?? 0).toLocaleString('vi-VN')} đ</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {draftLabs.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[13px] font-semibold text-slate-800 mb-1.5 flex justify-between">
                  <span>Cận lâm sàng ({draftLabs.length})</span>
                </h4>
                <ul className="text-[12px] space-y-1.5 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  {draftLabs.map((s, i) => (
                    <li key={`${s.id}-${i}`} className="flex justify-between gap-4">
                      <span className="truncate flex-1 text-slate-700">· {s.name}</span>
                      <span className="font-medium">{(s.price ?? 0).toLocaleString('vi-VN')} đ</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <span className="font-bold text-[13px] text-slate-700">Tổng phí dự kiến:</span>
              <span className="font-bold text-[16px] text-blue-700">
                {expectedTotal.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="h-[38px] text-[13px]">
              Xem lại
            </Button>
            <Button 
              onClick={() => {
                setIsConfirmOpen(false);
                onFinalize();
              }} 
              disabled={isSaving} 
              className="bg-blue-600 hover:bg-blue-700 text-white h-[38px] text-[13px]"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu chỉ định ngay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
