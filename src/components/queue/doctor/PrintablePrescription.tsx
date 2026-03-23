'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { PrescriptionItemDto } from '@/lib/api/medical-records';

interface PrintablePrescriptionProps {
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  };
  doctorName?: string;
  prescriptionItems: PrescriptionItemDto[];
  diagnosisName?: string;
  diagnosisCode?: string;
  treatmentPlan?: string;
  bookingCode?: string;
  weight?: string;
  height?: string;
}

export function PrintablePrescription({
  patientProfile,
  doctorName,
  prescriptionItems,
  diagnosisName,
  diagnosisCode,
  treatmentPlan,
  bookingCode,
  weight,
  height,
}: PrintablePrescriptionProps) {
  const t = useTranslations('dashboard.doctor.workspace.prescriptionTab');
  
  if (!patientProfile) return null;

  const age = patientProfile.dateOfBirth
    ? new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()
    : 'N/A';

  const genderStr = patientProfile.gender === 'MALE' ? 'Nam' : patientProfile.gender === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <div 
      id="printable-prescription" 
      className="hidden print:block w-full bg-white p-8 text-black font-sans leading-relaxed"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold uppercase">Phòng Khám Đa Khoa SmartClinic</h1>
          <p className="text-xs">Số 123 Xã Đàn, Đống Đa, Hà Nội</p>
          <p className="text-xs">Hotline: 1900 1234 - Website: smartclinic.vn</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase mb-1">{t('printTitle')}</h2>
          <p className="text-xs">Ngày in: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          {bookingCode && <p className="text-sm font-bold mt-1">Mã BN: {patientProfile.patientCode || bookingCode}</p>}
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-y-2 text-sm">
          <div className="col-span-8">
            <span className="font-semibold">Họ và tên:</span> <span className="font-bold text-base uppercase">{patientProfile.fullName}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Tuổi:</span> {age}
          </div>
          <div className="col-span-2 text-right">
            <span className="font-semibold">Giới tính:</span> {genderStr}
          </div>
          
          <div className="col-span-12">
            <span className="font-semibold">Địa chỉ:</span> <span className="text-gray-700">Đống Đa, Hà Nội</span>
          </div>
          
          <div className="col-span-4">
            <span className="font-semibold">Cân nặng:</span> {weight || '...'} kg
          </div>
          <div className="col-span-4">
            <span className="font-semibold">Chiều cao:</span> {height || '...'} cm
          </div>
          <div className="col-span-4 text-right">
             <span className="font-semibold">SĐT:</span> {patientProfile.phone || 'N/A'}
          </div>
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
        <p className="text-sm">
          <span className="font-bold uppercase mr-2 text-gray-800">Chẩn đoán:</span>
          <span className="font-semibold">
            {diagnosisName ? `${diagnosisName} ${diagnosisCode ? `(${diagnosisCode})` : ''}` : 'Chưa có chẩn đoán cụ thể'}
          </span>
        </p>
        {treatmentPlan && (
          <p className="text-sm mt-1">
            <span className="font-bold uppercase mr-2 text-gray-800">Lời dặn:</span>
            <span className="italic">{treatmentPlan}</span>
          </p>
        )}
      </div>

      {/* Prescription Table */}
      <div className="mb-8">
        <h3 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">Danh mục thuốc</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-2 font-bold w-10">STT</th>
              <th className="text-left py-2 font-bold">Tên thuốc / Hàm lượng</th>
              <th className="text-center py-2 font-bold w-20">Số lượng</th>
              <th className="text-center py-2 font-bold w-20">ĐVT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prescriptionItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500 italic">Chưa có thuốc trong đơn</td>
              </tr>
            ) : (
              prescriptionItems.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="py-3 text-center">{index + 1}</td>
                  <td className="py-3">
                    <div className="font-bold text-gray-900">{item.medicineName}</div>
                    <div className="text-xs text-gray-700 mt-1 font-medium italic">
                      {item.dosage} - {item.frequency} {item.durationDays ? `- Dùng trong ${item.durationDays} ngày` : ''}
                    </div>
                    {item.instructions && (
                      <div className="text-xs text-blue-800 mt-1">HDSĐ: {item.instructions}</div>
                    )}
                  </td>
                  <td className="py-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 text-center uppercase text-xs">{item.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Signature Area */}
      <div className="mt-12 flex justify-between items-start">
        <div className="w-1/2">
          <p className="text-xs font-bold uppercase underline mb-2 tracking-tight">Cộng dược:</p>
          <p className="text-[11px] leading-tight text-gray-600">
            * Bệnh nhân vui lòng mang đơn thuốc này đến Nhà thuốc để mua thuốc.<br/>
            * Kiểm tra tên thuốc, số lượng và hạn sử dụng trước khi rời quầy.<br/>
            * Tái khám đúng hẹn hoặc khi có dấu hiệu bất thường.
          </p>
        </div>
        <div className="w-2/5 text-center">
          <p className="text-sm italic mb-1">Ngày {format(new Date(), 'dd')} tháng {format(new Date(), 'MM')} năm {format(new Date(), 'yyyy')}</p>
          <p className="font-bold text-sm uppercase mb-20 text-gray-900">Bác sĩ điều trị</p>
          <p className="font-bold text-base text-blue-700">{doctorName || 'Dr. SmartClinic'}</p>
          <p className="text-[10px] text-gray-500 font-medium">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      {/* Page number or watermark if needed */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 print:block hidden">
        SmartClinic - Mang lại nụ cười và sức khỏe cho cộng đồng
      </div>
    </div>
  );
}
