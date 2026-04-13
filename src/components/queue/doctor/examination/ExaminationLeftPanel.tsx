'use client';

import { useTranslations } from 'next-intl';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { type VisitServiceOrder } from '@/lib/api/clinical/medical-records';
import { differenceInYears } from 'date-fns';
import { CheckCircleIcon, NoteIcon } from '@phosphor-icons/react';

interface ExaminationLeftPanelProps {
  item: QueueRecord;
  orders: VisitServiceOrder[];
}

export function ExaminationLeftPanel({ item, orders }: ExaminationLeftPanelProps) {
  const t = useTranslations('emr.visit');
  const patient = item.booking.patientProfile;

  if (!patient) return null;

  const age = patient.dateOfBirth
    ? differenceInYears(new Date(), new Date(patient.dateOfBirth))
    : 'N/A';

  const genderStr = patient.gender === 'MALE' ? 'Nam'
    : patient.gender === 'FEMALE' ? 'Nữ'
      : 'Khác';

  return (
    <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
      <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

        {/* Patient Header */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-br from-slate-50 to-white">
          <div className="w-[42px] h-[42px] rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[16px] shadow-sm shrink-0 border border-blue-200">
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-slate-800 leading-tight">
              {patient.fullName}
            </h2>
            <div className="text-[12px] text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
              <span>{genderStr}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
              <span>{age} {t('patientInfo.yearsOld')}</span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-5 border-b border-gray-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('leftPanel.profile') || 'Thông tin bệnh nhân'}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[12px]">{t('leftPanel.patientCode') || 'Mã BN'}</span>
              <span className="text-slate-900 text-[12px] font-medium text-right bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{patient.patientCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[12px]">Số điện thoại</span>
              <span className="text-slate-900 text-[12px] font-medium text-right">{patient.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-start mt-2 pt-2 border-t border-dashed border-gray-200">
              <span className="text-slate-500 text-[12px]">Lý do khám gốc</span>
              <span className="text-slate-900 text-[12px] font-medium text-right max-w-[65%]">
                {item.booking.patientNotes || 'Không ghi nhận'}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Context from Consultation */}
        <div className="p-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Chỉ định chuyên khoa
          </div>

          {orders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {orders.map(order => (
                <div key={order.id} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-[12px] font-bold text-blue-900 mb-1">{order.service.name}</div>
                  <div className="flex items-start gap-1.5 mt-2">
                    <NoteIcon size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-[11px] text-blue-800 leading-relaxed italic">
                      Yêu cầu ghi nhận kết quả khám chuyên khoa tương ứng.
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trạng thái</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold border border-green-200">
                      <CheckCircleIcon size={12} weight="fill" /> Đã thu phí
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12px] text-slate-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
              Chưa có chỉ định nào được chọn.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
