'use client';

import { MedicalRecordForm } from '@/components/emr/MedicalRecordForm';

interface DoctorEMRTabProps {
  bookingId: string;
  visible?: boolean;
}

export function DoctorEMRTab({ bookingId, visible = true }: DoctorEMRTabProps) {
  return (
    <MedicalRecordForm
      bookingId={bookingId}
      isLoading={false}
      initialData={null}
      visible={visible}
    />
  );
}
