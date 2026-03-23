'use client';

import { Invoice } from '@/lib/api/billing';
import { useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export function PrintableQueueTicket({ invoice }: { invoice: Invoice }) {
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const queuePosition = invoice.booking?.queueRecord?.queuePosition;

  return (
    <div id="printable-invoice" className="hidden print:block font-sans text-sm pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: portrait;
            margin: 10mm auto;
          }
        }
      `}} />
      <div 
        className="mx-auto border-2 border-slate-900 border-dashed bg-white text-black p-6 mt-4"
        style={{ width: '100%', maxWidth: '340px' }}
      >
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">SMART CLINIC</h1>
          <p className="text-[10px] font-bold text-slate-600 mt-1">HỆ THỐNG PHÒNG KHÁM THÔNG MINH</p>
          <p className="text-[10px] text-slate-500 mt-1">Số 123 Xã Đàn, Đống Đa, Hà Nội</p>
        </div>

        {/* Ticket Number */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1392ec] mb-2">PHIẾU SỐ THỨ TỰ</h2>
          <div className="text-6xl font-black text-slate-900 mb-2 py-3 bg-slate-50 rounded-lg">
            {queuePosition != null ? String(queuePosition).padStart(3, '0') : 'N/A'}
          </div>
          <p className="text-sm font-bold text-slate-700">
            {invoice.booking?.service?.name || 'Khám tổng quát'}
          </p>
          <p className="text-xs font-medium text-slate-600 mt-1">
            Bác sĩ: {invoice.booking?.doctor?.fullName || 'N/A'}
          </p>
        </div>

        {/* Patient Info */}
        <div className="text-xs space-y-2 mb-8 border-t border-slate-300 pt-4">
          <p className="flex justify-between">
            <span className="text-slate-500">Khách hàng:</span>
            <span className="font-bold text-slate-900 line-clamp-1 max-w-[150px] text-right">
              {invoice.booking?.patientProfile?.fullName}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">Mã KH:</span>
            <span className="font-medium text-slate-800">{invoice.booking?.patientProfile?.patientCode || 'N/A'}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">TG đăng ký:</span>
            <span className="font-medium text-slate-800">{format(new Date(), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}</span>
          </p>
        </div>

        {/* Queue Info */}
        <div className="bg-slate-50 px-3 py-4 rounded text-center border border-slate-200">
          <p className="text-[11px] font-medium text-slate-800">
            Vui lòng theo dõi màn hình hiển thị để đến lượt khám.
          </p>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            Xin cảm ơn quý khách!
          </p>
        </div>
      </div>
    </div>
  );
}
