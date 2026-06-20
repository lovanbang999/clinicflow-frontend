'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { DoctorWorkspace } from '@/components/queue/doctor/DoctorWorkspace';
import { Loader2 } from 'lucide-react';

export default function DoctorDashboardPage() {
  const { user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1275e2]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DoctorWorkspace
      doctorId={user.id}
      doctorName={user.fullName}
    />
  );
}

