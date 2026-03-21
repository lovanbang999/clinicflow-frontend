'use client';

import { MedicalRecordForm } from '@/components/emr/MedicalRecordForm';

interface DoctorEMRTabProps {
  bookingId: string;
  onFinished?: () => void;
  visible?: boolean;
}

export function DoctorEMRTab({ bookingId, onFinished, visible = true }: DoctorEMRTabProps) {
  return (
    <MedicalRecordForm
      bookingId={bookingId}
      isLoading={false}
      initialData={null}
      onFinished={onFinished}
      visible={visible}
    />
  );
}
