'use client';

import { format } from 'date-fns';
import type { CreateMedicalRecordDto } from '@/lib/api/medical-records';

interface PrintableExaminationResultProps {
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    weightKg?: number;
    heightCm?: number;
  };
  doctorName?: string;
  medicalRecord: CreateMedicalRecordDto;
  bookingCode?: string;
}

export function PrintableExaminationResult({
  patientProfile,
  doctorName,
  medicalRecord,
  bookingCode,
}: PrintableExaminationResultProps) {
  if (!patientProfile) return null;

  const age = patientProfile.dateOfBirth
    ? new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()
    : 'N/A';

  const genderStr = patientProfile.gender === 'MALE' ? 'Nam' : patientProfile.gender === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <div 
      id="printable-exam-result" 
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
          <h2 className="text-2xl font-bold uppercase mb-1">Phiếu Kết Quả Khám Bệnh</h2>
          <p className="text-xs">Ngày khám: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
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
            <span className="font-semibold">Cân nặng:</span> {patientProfile.weightKg || '...'} kg
          </div>
          <div className="col-span-4">
            <span className="font-semibold">Chiều cao:</span> {patientProfile.heightCm || '...'} cm
          </div>
          <div className="col-span-4 text-right">
             <span className="font-semibold">SĐT:</span> {patientProfile.phone || 'N/A'}
          </div>
        </div>
      </div>

      {/* Clinical Exam Content */}
      <div className="space-y-6 mb-8 text-sm">
        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">1. Lý do khám & Triệu chứng</h3>
          <p className="whitespace-pre-wrap italic">{medicalRecord.chiefComplaint || 'N/A'}</p>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">2. Kết quả khám lâm sàng</h3>
          <p className="whitespace-pre-wrap">{medicalRecord.clinicalFindings || 'N/A'}</p>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">3. Chẩn đoán xác định</h3>
          <p className="font-bold text-base">
            [{medicalRecord.diagnosisCode}] {medicalRecord.diagnosisName}
          </p>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">4. Hướng dẫn điều trị & Lời dặn</h3>
          <p className="whitespace-pre-wrap font-medium">{medicalRecord.treatmentPlan || 'Nghỉ ngơi và theo dõi sức khỏe.'}</p>
        </div>

        {medicalRecord.followUpDate && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h3 className="font-bold uppercase text-blue-800 pb-1 mb-1">5. Hẹn tái khám</h3>
            <p className="font-bold text-lg">
              Ngày {format(new Date(medicalRecord.followUpDate), 'dd/MM/yyyy')}
            </p>
            <p className="text-xs text-blue-600 italic">* Vui lòng mang theo phiếu này khi tái khám.</p>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="mt-12 flex justify-end">
        <div className="w-2/5 text-center">
          <p className="text-sm italic mb-1">Ngày {format(new Date(), 'dd')} tháng {format(new Date(), 'MM')} năm {format(new Date(), 'yyyy')}</p>
          <p className="font-bold text-sm uppercase mb-20 text-gray-900">Bác sĩ điều trị</p>
          <p className="font-bold text-base text-blue-700">{doctorName || 'Dr. SmartClinic'}</p>
          <p className="text-[10px] text-gray-500 font-medium">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 print:block hidden">
        SmartClinic - Tận tâm - Chuyên nghiệp - Hiệu quả
      </div>
    </div>
  );
}
