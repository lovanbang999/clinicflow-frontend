'use client';

import React from 'react';

// Common structure for General Form
function GeneralExamFields() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Trạng thái bệnh nhân/Mô tả lâm sàng</label>
        <textarea 
          rows={3}
          className="w-full text-[13px] rounded-md border border-slate-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="Nhập mô tả các dấu hiệu ghi nhận được trong quá trình thăm khám..."
        />
      </div>
      <div>
         <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Kết luận</label>
        <textarea 
          rows={2}
          className="w-full text-[13px] rounded-md border border-slate-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="Nhập kết luận chuyên khoa..."
        />
      </div>
      <div className="flex items-center gap-2 mt-2 bg-red-50 p-3 rounded-md border border-red-100">
        <input type="checkbox" id="isAbnormal" className="rounded text-red-600 focus:ring-red-500 border-gray-300 pointer-events-auto" />
        <label htmlFor="isAbnormal" className="text-[12px] font-semibold text-red-700 cursor-pointer">Đánh dấu có bất thường (Abnormal)</label>
      </div>
    </div>
  );
}

// Eye Exam structure
function EyeExamFields() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="text-[12px] font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">MẮT PHẢI (MP)</h4>
          <div className="space-y-3">
             <div>
                <label className="block text-[11px] text-slate-500 mb-1">Thị lực không kính</label>
                <input type="text" className="w-full text-[13px] rounded border border-slate-300 px-2.5 py-1.5" placeholder="VD: 8/10" />
             </div>
             <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nhãn áp (mmHg)</label>
                <input type="text" className="w-full text-[13px] rounded border border-slate-300 px-2.5 py-1.5" placeholder="VD: 14" />
             </div>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="text-[12px] font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">MẮT TRÁI (MT)</h4>
          <div className="space-y-3">
             <div>
                <label className="block text-[11px] text-slate-500 mb-1">Thị lực không kính</label>
                <input type="text" className="w-full text-[13px] rounded border border-slate-300 px-2.5 py-1.5" placeholder="VD: 10/10" />
             </div>
             <div>
                <label className="block text-[11px] text-slate-500 mb-1">Nhãn áp (mmHg)</label>
                <input type="text" className="w-full text-[13px] rounded border border-slate-300 px-2.5 py-1.5" placeholder="VD: 15" />
             </div>
          </div>
        </div>
      </div>
      <div>
         <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Khám đáy mắt & Tổn thương</label>
         <textarea rows={2} className="w-full text-[13px] rounded-md border border-slate-300 p-2.5" placeholder="Mô tả tổn thương (nếu có)..." />
      </div>
      <GeneralExamFields />
    </div>
  );
}

// Add more mappings here for DENTAL, ENT...
const formMap: Record<string, React.FC> = {
  GENERAL: GeneralExamFields,
  EYE: EyeExamFields,
  DENTAL: GeneralExamFields, // Placeholder
  ENT: GeneralExamFields,    // Placeholder
  CARDIOLOGY: GeneralExamFields, // Placeholder
  DERMATOLOGY: GeneralExamFields, // Placeholder
};

interface ExaminationExtendedFieldsProps {
  examFormType: string;
}

export function ExaminationExtendedFields({ examFormType }: ExaminationExtendedFieldsProps) {
  const Component = formMap[examFormType] || GeneralExamFields;
  return <Component />;
}
