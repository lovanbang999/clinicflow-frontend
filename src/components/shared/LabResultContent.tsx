'use client';

import React from 'react';

function formatKey(key: string) {
  // Mapping for common medical terms in Vietnamese
  const labels: Record<string, string> = {
    heartRate: 'Nhịp tim',
    prInterval: 'Khoảng PR',
    qrsDuration: 'Thời gian QRS',
    qtcInterval: 'Khoảng QTc',
    axis: 'Trục điện tim',
    rhythm: 'Nhịp',
    stSegment: 'Đoạn ST',
    pWave: 'Sóng P',
    qWave: 'Sóng Q',
    description: 'Mô tả chi tiết',
    conclusion: 'Kết luận chuyên môn',
    abnormalNote: 'Ghi chú bất thường',
    // Blood count common terms
    wbc: 'Bạch cầu (WBC)',
    rbc: 'Hồng cầu (RBC)',
    hgb: 'Huyết sắc tố (HGB)',
    hct: 'Dung tích hồng cầu (HCT)',
    plt: 'Tiểu cầu (PLT)',
  };

  if (labels[key]) return labels[key];

  // Fallback: convert camelCase to Title Case
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

interface LabResultContentProps {
  text: string;
  noDetailDesc?: string;
  className?: string;
}

export function LabResultContent({ text, noDetailDesc = 'Không có chi tiết', className = '' }: LabResultContentProps) {
  if (!text) return <p className={`text-[13px] text-gray-400 italic ${className}`}>{noDetailDesc}</p>;

  let parsedData: Record<string, unknown> | null = null;
  try {
    const data = JSON.parse(text);
    if (typeof data === 'object' && data !== null) {
      parsedData = data;
    }
  } catch {
    // Not JSON, will fall back to plain text
  }

  if (parsedData) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 shadow-sm ${className}`}
      >
        {Object.entries(parsedData).map(([key, value]) => {
          if (value === '' || key === 'abnormalNote' || value === null) return null;

          const isLongText =
            String(value).length > 50 || key === 'conclusion' || key === 'description';

          return (
            <div
              key={key}
              className={`flex flex-col gap-0.5 pb-1 border-b border-slate-100/50 last:border-0 ${
                isLongText ? 'md:col-span-2' : ''
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {formatKey(key)}
              </span>
              <span className="text-[12px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return <p className={`text-[13px] leading-relaxed whitespace-pre-wrap text-slate-700 ${className}`}>{text}</p>;
}
