'use client';

import { Invoice } from '@/lib/api/billing';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export function PrintableInvoice({ invoice }: { invoice: Invoice }) {
  const t = useTranslations('dashboard.receptionist.billingManagement');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD' }).format(Number(val));
  };

  return (
    <div id="printable-invoice" className="hidden print:block p-8 bg-white text-black font-sans text-sm">
      {/* Header with Clinic Info */}
      <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SMART CLINIC</h1>
          <p className="text-sm mt-1 font-medium text-slate-600">HỆ THỐNG PHÒNG KHÁM ĐA KHOA THÔNG MINH</p>
          <div className="mt-4 text-xs space-y-1 text-slate-700">
             <p><span className="font-bold">Địa chỉ:</span> 123 Healthcare Ave, District 1, HCM</p>
             <p><span className="font-bold">Hotline:</span> 1900 1234 - <span className="font-bold">Website:</span> smartclinic.vn</p>
             <p><span className="font-bold">Mã số thuế:</span> 0102030405</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black uppercase tracking-widest text-[#1392ec] mb-1">HÓA ĐƠN DỊCH VỤ</h2>
          <p className="font-mono text-xl font-bold bg-slate-100 px-2 py-1 inline-block rounded">#{invoice.invoiceNumber}</p>
          <p className="text-xs mt-3 text-slate-500">{t('detail.createdAt')} {format(new Date(invoice.createdAt), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}</p>
        </div>
      </div>

      {/* Patient Section */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div className="space-y-2">
          <h3 className="font-bold border-b border-slate-300 pb-1 mb-3 uppercase text-xs tracking-wider text-slate-500">Thông tin bệnh nhân</h3>
          <p className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-500">Họ và tên:</span> <span className="font-bold text-base">{invoice.booking?.patientProfile?.fullName}</span></p>
          <p className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-500">Mã bệnh nhân:</span> <span className="font-mono font-medium">{invoice.booking?.patientProfile?.patientCode || 'N/A'}</span></p>
          <p className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-500">Số điện thoại:</span> <span>{invoice.booking?.patientProfile?.phone || 'N/A'}</span></p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold border-b border-slate-300 pb-1 mb-3 uppercase text-xs tracking-wider text-slate-500">Thông tin chỉ định</h3>
          <p className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-500">Bác sĩ khám:</span> <span className="font-medium text-slate-900">{invoice.booking?.doctor?.fullName || 'N/A'}</span></p>
          <p className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-500">Trạng thái:</span> <span className="uppercase font-bold text-emerald-600">{invoice.status}</span></p>
          <p className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-500">Ngày in:</span> <span>{format(new Date(), 'dd/MM/yyyy')}</span></p>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-t-2 border-b border-slate-900 bg-slate-50/50">
              <th className="py-3 text-left px-3 text-xs uppercase font-bold text-slate-600">Dịch vụ / Chỉ định</th>
              <th className="py-3 text-center px-3 w-16 text-xs uppercase font-bold text-slate-600">SL</th>
              <th className="py-3 text-right px-3 w-32 text-xs uppercase font-bold text-slate-600">Đơn giá</th>
              <th className="py-3 text-right px-3 w-32 text-xs uppercase font-bold text-slate-600">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 italic">Không có dữ liệu dịch vụ</td>
              </tr>
            ) : (
              invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/20">
                  <td className="py-4 px-3 font-semibold text-slate-800">
                    {item.itemName}
                    {item.isLab && <span className="ml-2 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 uppercase">CLS</span>}
                  </td>
                  <td className="py-4 px-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-4 px-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-3 text-right font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-16">
        <div className="w-80 p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
            <div className="flex justify-between text-slate-600 text-xs uppercase tracking-tighter">
                <span>Tổng chi phí phát sinh:</span>
                <span className="font-bold">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-emerald-600 font-bold">
                <span>Số tiền đã thanh toán:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between pt-1 text-slate-900 font-bold border-t-2 border-slate-300 text-xl">
                <span>TỔNG CỘNG:</span>
                <span className="text-[#1392ec]">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <p className="text-right text-[10px] italic text-slate-500 mt-2">
              (Bằng chữ: ........................................................................................)
            </p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-3 gap-8 mt-20 text-center">
        <div className="space-y-20">
            <p className="font-bold uppercase text-xs">Phần Bệnh nhân</p>
            <div className="text-xs">
                <p className="font-bold underline">Nguyễn Văn A</p>
                <p className="text-[10px] text-slate-400 italic">(Đã ký)</p>
            </div>
        </div>
        <div className="space-y-20">
             <p className="font-bold uppercase text-xs">Phần Thu ngân</p>
             <div className="text-xs">
                <p className="font-bold underline">Trần Thị Thu</p>
                <p className="text-[10px] text-slate-400 italic">(Đã ký)</p>
            </div>
        </div>
        <div className="space-y-20">
             <div className="space-y-1">
                <p className="italic text-[10px] text-slate-500">HCM, {format(new Date(), 'dd/MM/yyyy')}</p>
                <p className="font-bold uppercase text-xs underline decoration-2 underline-offset-4">Xác nhận của Bệnh viện</p>
             </div>
             <div className="w-24 h-24 border-2 border-red-500/30 rounded-full mx-auto flex items-center justify-center text-red-500/30 font-black text-[10px] uppercase rotate-[-15deg]">
                SMART CLINIC<br/>PAID
             </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6">
        Mọi thắc mắc vui lòng liên hệ Hotline 1900 1234. Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ tại Smart Clinic!
        <p className="mt-1 font-mono tracking-widest">SC-BILLING-V2-{invoice.id.substring(0,8).toUpperCase()}</p>
      </div>
    </div>
  );
}
