'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { type LabOrder } from '@/lib/api/lab-orders';

interface PrintableLabOrderProps {
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  };
  doctorName?: string;
  labOrders: LabOrder[];
  bookingCode?: string;
}

export function PrintableLabOrder({
  patientProfile,
  doctorName,
  labOrders,
  bookingCode,
}: PrintableLabOrderProps) {
  const t = useTranslations('dashboard.doctor.workspace.labTab');
  
  if (!patientProfile || labOrders.length === 0) return null;

  const age = patientProfile.dateOfBirth
    ? new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()
    : 'N/A';

  const genderStr = patientProfile.gender === 'MALE' ? 'Nam' : patientProfile.gender === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <div id="printable-lab-order" className="hidden print:block w-full bg-white p-8 text-black font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase">Phòng Khám Đa Khoa SmartClinic</h1>
          <p className="text-sm">123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p className="text-sm">Hotline: 1900 1234</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase mb-1">{t('printTitle') || 'PHIẾU CHỈ ĐỊNH CẬN LÂM SÀNG'}</h2>
          <p className="text-sm">Ngày in: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          {bookingCode && <p className="text-sm font-bold mt-1">Mã khám: {bookingCode}</p>}
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-6">
        <h3 className="text-base font-bold uppercase mb-2 border-b border-gray-300 pb-1">Thông tin bệnh nhân</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-semibold">Họ và tên:</span> <span className="font-bold text-base">{patientProfile.fullName}</span></p>
            <p><span className="font-semibold">Mã BN:</span> {patientProfile.patientCode || 'N/A'}</p>
            <p><span className="font-semibold">Điện thoại:</span> {patientProfile.phone || 'N/A'}</p>
          </div>
          <div>
            <p><span className="font-semibold">Tuổi:</span> {age}</p>
            <p><span className="font-semibold">Giới tính:</span> {genderStr}</p>
            <p><span className="font-semibold">Bác sĩ chỉ định:</span> {doctorName || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="mb-8">
        <h3 className="text-base font-bold uppercase mb-2 border-b border-gray-300 pb-1">Danh sách chỉ định</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-2 font-semibold">STT</th>
              <th className="text-left py-2 font-semibold">Tên Xét Nghiệm / Cận Lâm Sàng</th>
              <th className="text-left py-2 font-semibold">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {labOrders.map((order, index) => (
              <tr key={order.id} className="border-b border-gray-200">
                <td className="py-2 text-center w-12">{index + 1}</td>
                <td className="py-2 font-medium">{order.testName}</td>
                <td className="py-2 text-gray-600 italic text-xs">{order.testDescription || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Instructions */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div className="w-2/3">
          <p className="font-bold text-sm uppercase">Lưu ý quan trọng:</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
            <li><span className="font-bold underline">Vui lòng mang phiếu này ra quầy lễ tân để thanh toán</span> trước khi thực hiện xét nghiệm.</li>
            <li>Sau khi có kết quả, vui lòng mang kết quả quay lại phòng khám ban đầu để bác sĩ tư vấn.</li>
          </ul>
        </div>
        <div className="w-1/3 text-center">
          <p className="text-sm italic mb-16">Ngày ..... tháng ..... năm .....</p>
          <p className="font-bold text-sm">Bác sĩ chỉ định</p>
          <p className="text-xs text-gray-500">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
}
