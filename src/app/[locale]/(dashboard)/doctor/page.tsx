'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { DoctorWorkspace } from '@/components/queue/doctor/DoctorWorkspace';

export default function DoctorDashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <DoctorWorkspace
      doctorId={user.id}
      doctorName={user.fullName}
    />
  );
}
